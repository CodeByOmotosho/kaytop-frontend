import apiClient from "@/lib/apiClient";
import { apiBaseUrl } from "@/lib/config";
import { AxiosError } from "axios";

export class DashboardService {
  static async getDashboardKpi(timeFilter: string) {
    try {
      
      const response = await apiClient.get(`${apiBaseUrl}/dashboard/kpi`, {
        params: {
          timeFilter,
        },
      });
      console.log(response);
      return response.data;
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log(err);
      console.log("Error fetching dashboard kpi", err.response?.data);
      throw err;
    }
  }
}
