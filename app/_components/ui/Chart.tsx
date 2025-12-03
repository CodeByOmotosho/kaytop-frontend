"use client";

import React, { JSX } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Rectangle,
  ResponsiveContainer,
} from "recharts";

interface ChartProps {
  name: string;
  uv: number;
  pv: number;
  amt: number;
}

const data: ChartProps[] = [
  { name: "Page A", uv: 4000, pv: 2400, amt: 2400 },
  { name: "Page B", uv: 3000, pv: 1398, amt: 2210 },
  { name: "Page C", uv: 2000, pv: 9800, amt: 2290 },
  { name: "Page D", uv: 2780, pv: 3908, amt: 2000 },
  { name: "Page E", uv: 1890, pv: 4800, amt: 2181 },
  { name: "Page F", uv: 2390, pv: 3800, amt: 2500 },
  { name: "Page G", uv: 3490, pv: 4300, amt: 2100 },
];

const Chart = (): JSX.Element => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />

        <Bar
          dataKey="pv"
          fill="#66CCFF"
          activeBar={<Rectangle fill="#101828" stroke="#330066" />}
        />
        <Bar
          dataKey="uv"
          fill="#7F56D9"
          activeBar={<Rectangle fill="#330066" stroke="#101828" />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Chart;
