import React, { JSX } from "react";
import Pagination from "../Pagination";
import { Meta } from "@/app/types/dashboard";
import { formatDate } from "@/lib/utils";
import {
  CreditOfficerData,
  CreditOfficerErrorResponse,
} from "@/app/types/creditOfficer";
import { AxiosError } from "axios";
import SpinnerLg from "../SpinnerLg";
import Link from "next/link";

interface TableProps {
  isLoading: boolean;
  error: AxiosError<CreditOfficerErrorResponse> | null;
  item?: CreditOfficerData[];
  meta?: Meta;
  onPageChange?: (page: number) => void;
}

export default function CreditOfficerTable({
  isLoading,
  error,
  item,
  meta,
  onPageChange,
}: TableProps) {
  if (error) {
    return (
      <p className="text-center text-red-400">{error.response?.data.message}</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-md">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Created by</th>
            <th>Date joined</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={6}>
                <div className="flex items-center justify-center">
                  <SpinnerLg />
                </div>
              </td>
            </tr>
          )}

          {!isLoading && item?.length === 0 && (
            <tr>
              <td colSpan={6}>No credit officers found</td>
            </tr>
          )}

          {item?.map((officer, index) => {
            return (
              <tr key={officer.id}>
                <th>{index + 1}</th>
                <td>
                  {officer.firstName} {officer.lastName}
                </td>
                <td>{officer.email}</td>
                <td>{officer.createdBy.firstName}</td>
                <td>{formatDate(officer.createdAt)}</td>
                <td>
                  <Link href={`/dashboard/bm/credit/officer/${officer.id}`}>
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
