import { CustomerService } from "@/app/services/customerService";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export function useBranchCustomerLoan() {
  const params = useParams();
  const customerId = Number(params.customerId);

  const { isLoading, error, data } = useQuery({
    queryKey: ["loan-customerId", customerId],
    queryFn: () => {
      return CustomerService.getBranchCustomerLoan(customerId);
    },
    enabled: !!customerId,
  });

  return { isLoading, error, data };
}
