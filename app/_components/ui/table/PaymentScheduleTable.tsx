import { ApiResponseError } from "@/app/types/auth";
import { Transactions } from "@/app/types/customer";
import { Meta } from "@/app/types/dashboard";
import { AxiosError } from "axios";
import Pagination from "../Pagination";
import TableState from "./TableState";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Schedule } from "@/app/types/loan";

interface TableProps {
  isLoading: boolean;
  error: AxiosError<ApiResponseError> | null;
  item?: Schedule[];
  meta?: Meta;
  onPageChange?: (page: number) => void;
}

export default function PaymentScheduleTable({
  isLoading,
  error,
  item,
  meta,
  onPageChange,
}: TableProps) {
 

  return (
    <div className="overflow-x-auto">
      <table className="table table-md">
        <thead>
          <tr>
            <th>Day</th>
            <th>Amount Paid</th>
            <th>Amount Due</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Date</th>
            
          </tr>
        </thead>
        <tbody>
          <TableState
            isLoading={isLoading}
            error={error}
            isEmpty={!isLoading && item?.length === 0}
            colSpan={6}
            emptyMessage="No payment schedule data available yet!!"
          />

          {item?.map((schedule, index) => {
            return (
              <tr key={index}>
                <td>
                  {schedule.day}
                </td>
                <td>{formatCurrency(schedule.paidAmount)}</td>
                <td>{formatCurrency(schedule.dueAmount)}</td>
                <td>{formatCurrency(schedule.remainingBalance)}</td>
                <td>{schedule.status}</td>
                <td>{formatDate(schedule.dueDate)}</td>
               
              </tr>
            );
          })}
        </tbody>
      </table>
      {meta && onPageChange && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
