import { SettingsService } from "@/app/services/settingsService";
import { ApiResponseError } from "@/app/types/auth";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useProfile() {
  const { isLoading, error, data } = useQuery<
    unknown[],
    AxiosError<ApiResponseError>
  >({
    queryKey: ["profile"],
    queryFn: SettingsService.getProfile,
  });

  return { isLoading, error, data };
}
