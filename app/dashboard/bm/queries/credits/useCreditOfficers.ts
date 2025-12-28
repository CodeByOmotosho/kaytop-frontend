import { CreditService } from "@/app/services/creditService";
import {
  CreditOfficerErrorResponse,
  CreditOfficerListResponse,
  
} from "@/app/types/creditOfficer";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSearchParams } from "next/navigation";

export function useCreditOfficers() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("creditOfficersPage") ?? "1");
  const limit = 10;

  const { isLoading, error, data } = useQuery<
    CreditOfficerListResponse,
    AxiosError<CreditOfficerErrorResponse>
  >({
    queryKey: ["credit-officers", page, limit],
    queryFn: ({ queryKey }) => {
      const [, page, limit] = queryKey as [string, number, number];
      return CreditService.getCreditOfficers({ page, limit });
    },
    select: (response) => {
      if (Array.isArray(response)) {
        return {
          data: response,
          meta: undefined,
        };
      }

      return response;
    },
  });

  return { isLoading, error, data };
}
