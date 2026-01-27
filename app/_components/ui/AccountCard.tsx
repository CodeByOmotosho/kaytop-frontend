/**
 * AccountCard Component
 * Display account information with chart visualization matching Figma design
 */

import { useState } from 'react';
import {
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
} from 'recharts';

interface AccountCardProps {
  title: string;
  subtitle: string;
  amount: string;
  growth: number;
  chartData: { value: number; color: string }[];
  chartType: 'loan' | 'savings';
  percentage?: number; // For loan repayment donut chart
}

export default function AccountCard({
  title,
  subtitle,
  amount,
  growth,
  chartData,
  chartType,
  percentage
}: AccountCardProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Prepare data for Recharts - handle empty data
  const rechartData = chartData && chartData.length > 0 ? chartData.map((item, index) => ({
    name: index === 0 ? 'Filled' : 'Remaining',
    value: item.value || 0,
    color: item.color
  })) : [
    { name: 'No Data', value: 100, color: '#F2F4F7' }
  ];

  return (
    <div
      className="flex items-center gap-6 rounded-xl"
      style={{
        width: '551px',
        height: '168px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #EAECF0',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)'
      }}
    >
      {/* Chart Container */}
      <div 
        style={{ 
          width: '120px', 
          height: '120px',
          position: 'relative',
          minWidth: '120px',
          minHeight: '120px',
          flexShrink: 0
        }}
      >
        <ResponsiveContainer width={120} height={120}>
          <RechartsPieChart width={120} height={120}>
            <Pie
              data={rechartData}
              cx={60}
              cy={60}
              innerRadius={30}
              outerRadius={55}
              dataKey="value"
              nameKey="name"
              paddingAngle={0}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              startAngle={90}
              endAngle={450}
            >
              {rechartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                />
              ))}
            </Pie>
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center flex-1">
        {/* Title */}
        <h3
          className="text-base font-semibold mb-1"
          style={{ 
            color: '#101828',
            fontSize: '16px',
            fontWeight: 600,
            lineHeight: '24px'
          }}
        >
          {title}
        </h3>

        {/* Subtitle */}
        <p
          className="text-sm font-medium mb-3"
          style={{ 
            color: '#475467',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px'
          }}
        >
          {subtitle}
        </p>

        {/* Amount */}
        <p
          className="text-3xl font-semibold mb-3"
          style={{ 
            color: '#101828', 
            fontSize: '30px',
            fontWeight: 600,
            lineHeight: '38px'
          }}
        >
          {amount}
        </p>

        {/* Growth Badge */}
        <div
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full w-fit"
          style={{
            backgroundColor: '#ECFDF3',
            padding: '2px 8px'
          }}
        >
          {/* Up Arrow Icon */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 9.5V2.5M6 2.5L2.5 6M6 2.5L9.5 6"
              stroke="#027A48"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Growth Text */}
          <span
            className="text-xs font-medium"
            style={{ 
              color: '#027A48',
              fontSize: '12px',
              fontWeight: 500,
              lineHeight: '18px'
            }}
          >
            +{growth.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
