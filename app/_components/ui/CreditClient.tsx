"use client";
import Table from "@/app/_components/ui/table/DisbursementTable";
import { getCreditOfficerMetrics } from "@/lib/utils";
import DashboardHeader from "./DashboardHeader";
import Metric from "./Metric";

import { useDashboardQuery } from "@/app/dashboard/bm/queries/kpi/useDashboardQuery";

export default function CreditClient() {
  const { isLoading, error, data } = useDashboardQuery();

  const metricData = getCreditOfficerMetrics({ data });

  return (
    <>
      <DashboardHeader data={data} />

      <Metric item={metricData} cols={1} isLoading={isLoading} error={error} />

      <div>
        <p className="pb-5 text-md">Credit officers</p>
        <div className="p-10 bg-white">
          <Table />
        </div>
      </div>
    </>
  );
}
