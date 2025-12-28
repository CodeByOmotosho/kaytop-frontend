import { PAGINATION_LIMIT } from "@/lib/config";
import { useSearchParams } from "next/navigation";
import { PaginationKey } from "../types/dashboard";

export function useUrlPagination(key: PaginationKey) {
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get(key) || 1));
  const limit = PAGINATION_LIMIT;

  return { page, limit };
}
