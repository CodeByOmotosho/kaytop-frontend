"use client";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import ErrorMessage from "./table/ErrorMessage";
import SpinnerLg from "./SpinnerLg";
import { ApiResponseError } from "@/app/types/auth";
import { AxiosError } from "axios";
import { SummaryProps } from "@/app/types/dashboard";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/app/hooks/useIsMobile";

interface SparklineProps {
  data: { value: number }[];
    isLoading: boolean;
    error?: AxiosError<ApiResponseError> | null;
    // data: SummaryProps[];
    isAnimationActive?: boolean;
    defaultIndex?: number;
}

export default function SavingsSparkline({ 
isLoading,
  error,
  data,
  isAnimationActive = true,
  defaultIndex, }: SparklineProps) {
      const [activeIndex, setActiveIndex] = useState<number>(defaultIndex ?? 0);
      const isMobile = useIsMobile();
    
      useEffect(() => {
      setActiveIndex(0);
    }, [data]);
    
     if (isLoading) {
        return (
          <div className="flex items-center justify-center h-[20vh]">
            <SpinnerLg />
          </div>
        );
      }
    
      if (error) {
        return (
          <div className="h-[20vh] flex items-center justify-center">
            <ErrorMessage error={error} />
          </div>
        );
      }

      const isGrowing =
  data.length > 1 &&
  data[data.length - 1].value >= data[0].value;

const strokeColor = isGrowing ? "#16a34a" : "#ef4444";

  return (
    <div
  style={{
    width: "100%",
    maxWidth: 300,   // much smaller than 425
    margin: "0 auto",
    height: 1,
    paddingBottom: `${isMobile ? "60%" : "40%"}`,  // smaller aspect ratio
    position: "relative",
  }}
>
     <h1 className="hidden font-semibold text-center md:block md:text-lg text-neutral-700">
        Savings Charts
      </h1>
  <ResponsiveContainer
    width="100%"
    height="100%"
    style={{ position: "absolute", top: 12, left: 24 }} 
    >
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.4} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>

        <Area
          type="monotone"
          dataKey="value"
          stroke="#7F56D9"
          strokeWidth={2}
          fill="url(#colorSavings)"
          dot={false}
          isAnimationActive={isAnimationActive}
        />
      </AreaChart>
    </ResponsiveContainer>
    </div>
  );
}