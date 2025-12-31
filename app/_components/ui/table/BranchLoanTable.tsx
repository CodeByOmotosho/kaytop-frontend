import { ApiResponseError } from "@/app/types/auth";
import { CustomerData } from "@/app/types/customer";
import { Meta } from "@/app/types/dashboard";
import { AxiosError } from "axios";
import Link from "next/link";
import Pagination from "../Pagination";
import TableState from "./TableState";
import { LoanData } from "@/app/types/loan";
import { formatCurrency } from "@/lib/utils";

interface TableProps {
  isLoading: boolean;
  error: AxiosError<ApiResponseError> | null;
  item?: LoanData[];
  meta?: Meta;
  onPageChange?: (page: number) => void;
}

export default function BranchLoanTable({
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
            <th>#</th>
            <th>Name</th>
            <th>Status</th>
            <th>Amount</th>
            <th>Intrest</th>
            <th>Disbursement Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <TableState
            isLoading={isLoading}
            error={error}
            isEmpty={!isLoading && item?.length === 0}
            colSpan={7}
            emptyMessage="No credit oficer data available yet!!"
          />

          {item?.map((loan, index) => {
            return (
              <tr key={index}>
                <th>{index + 1}</th>
                <td>{loan.borrower.name}</td>
                <td>{loan.status}</td>
                <td>{formatCurrency(Number(loan.amount))}</td>
                <td>{loan.interestRate}</td>
                <td>{loan.disbursementDate}</td>
                <td>
                  <Link
                    href={`/dashboard/bm/customer/details/${loan.borrower.email}`}
                  >
                    <img
                      className="w-4 cursor-pointer"
                      src="/view.svg"
                      alt="view icon"
                    />
                  </Link>
                </td>
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
