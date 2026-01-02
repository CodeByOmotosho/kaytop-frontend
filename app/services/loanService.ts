import apiClient from "@/lib/apiClient";
import { apiBaseUrl } from "@/lib/config";
import { AxiosError } from "axios";
import {
  BranchLoanApiResponse,
  BranchLoanResponse,
  LoanDetailsApiResponse,
  LoanDetailsResponse,
} from "../types/loan";

interface QueryParamsProps {
  loanId?: number;
  page: number;
  limit: number;
}

export class LoanService {
  static async getBranchLoans({
    page,
    limit,
  }: QueryParamsProps): Promise<BranchLoanResponse> {
    try {
      const response = await apiClient.get<BranchLoanApiResponse>(
        `${apiBaseUrl}/loans`,
        {
          params: {
            page,
            limit,
          },
        }
      );

      const { loans, total, totalPages } = response.data;

      return {
        data: loans,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error fetching all branch loans", err.response?.data);
      throw err;
    }
  }

  // {{baseUrl}}/loans/:loanId/summary
  // {{baseUrl}}/loans/:loanId/payment-schedule
  // {{baseUrl}}/loans/:loanId/details
  // {{baseUrl}}/loans?page=1&limit=20

  static async getLoanDetails({
    loanId,
    page,
    limit,
  }: QueryParamsProps): Promise<LoanDetailsResponse> {
    try {
      const response = await apiClient.get<LoanDetailsApiResponse>(
        `${apiBaseUrl}/loans/${loanId}/details`,
        {
          params: {
            page,
            limit,
          },
        }
      );
      return {
        data: response.data,
        meta: undefined,
      };
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error fetching loan details", err.response?.data);
      throw err;
    }
  }
}
