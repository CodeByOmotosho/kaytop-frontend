import React from 'react';

interface InfoField {
  label: string;
  value: string;
}

interface BranchInfoCardProps {
  fields: InfoField[];
}

export default function BranchInfoCard({ fields }: BranchInfoCardProps) {
  return (
    <div
      style={{
        width: '1096px',
        height: '97px',
        background: '#FFFFFF',
        border: '1px solid #EAECF0',
        borderRadius: '12px',
        boxShadow: '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '100px'
      }}
    >
      {fields.map((field, index) => (
        <div key={index} className="flex flex-col" style={{ gap: '4px' }}>
          {/* Label */}
          <div
            style={{
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '140%',
              color: '#7C8FAC'
            }}
          >
            {field.label}
          </div>

          {/* Value */}
          <div
            style={{
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '120%',
              color: '#1E3146'
            }}
          >
            {field.value}
          </div>
        </div>
      ))}
    </div>
  );
}
