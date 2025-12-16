"use client";
import { useDashboard } from "@/app/dashboard/bm/useDashboard";
import { data as dashboardData } from "@/lib/utils";
import React from "react";
import SpinnerLg from "./SpinnerLg";
import DashboardFilter from "./DashboardFilter";
import FilterButton from "./FilterButton";
import Metric from "./Metric";
import { MetricProps } from "@/app/types/dashboard";
import Chart from "./Chart";
import Table from "./Table";

const metricData: MetricProps[] = dashboardData;

export default  function DashboardClient() {
  
  const { isLoading, error, data } = useDashboard();
  console.log(data);
  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-[70vh]">
          <SpinnerLg />
        </div>
      ) : error ? (
        <div className="text-2xl text-center text-neutral-700">
          {error.response?.data?.message || "Failed to load KPI"}
        </div>
      ) : (
        <>
          <div className="leading-4 text-neutral-700">
            <h1 className="text-2xl font-medium">Overview</h1>
            <p className="text-md">Igando Branch</p>
          </div>
          <div className="flex flex-wrap items-center justify-between mt-10 gap-y-2">
            <div className="flex flex-wrap items-center gap-1 px-1 py-1 bg-white rounded-sm w-fit">
              <DashboardFilter />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <FilterButton className="flex gap-1 px-1 py-1 bg-white rounded-sm">
                <img src="/calendar.svg" alt="calendar" />
                <span> Select dates</span>
              </FilterButton>
              <FilterButton className="flex gap-1 px-1 py-1 bg-white rounded-sm">
                <img src="/filter.svg" alt="calendar" />
                <span>Filter</span>
              </FilterButton>
            </div>
          </div>
          <Metric item={metricData} />

          <div className="grid grid-cols-2 px-4 py-5 bg-white rounded-md">
            <div className="flex flex-col items-start px-4">
              <p className="text-sm text-gray-500">Active Loan</p>
              <h1 className="text-xl font-semibold">₦50,350.00</h1>
              <p className="text-sm text-green-500">+40% this month</p>
            </div>
            <div className="flex flex-col items-start px-4 border-l">
              <p className="text-sm text-gray-500">Missed Payment</p>
              <h1 className="text-xl font-semibold">₦50,350.00</h1>
              <p className="text-sm text-green-500">+40% this month</p>
            </div>
          </div>

          <div className="flex flex-col p-5 my-5 bg-white h-[40vh]">
            <Chart />
          </div>
          <div>
            <div className="my-5 text-gray-500 tabs tabs-border custom-tabs">
              <input
                type="radio"
                name="my_tabs_2"
                className="tab"
                aria-label="Disbursements"
                defaultChecked
              />
              <div className="p-10 bg-white tab-content">
                <Table />
              </div>

              <input
                type="radio"
                name="my_tabs_2"
                className="tab"
                aria-label="Re-collections"
              />
              <div className="p-10 bg-white tab-content">Tab content 2</div>

              <input
                type="radio"
                name="my_tabs_2"
                className="tab"
                aria-label="Savings"
              />
              <div className="p-10 bg-white tab-content">Tab content 3</div>
              <input
                type="radio"
                name="my_tabs_2"
                className="tab"
                aria-label="Missed payments"
              />
              <div className="p-10 bg-white tab-content">Tab content 4</div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
