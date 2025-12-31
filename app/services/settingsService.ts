import apiClient from "@/lib/apiClient";
import apiServer from "@/lib/apiServer";
import { apiBaseUrl } from "@/lib/config";
import { AxiosError } from "axios";

export class SettingsService {
  static async getProfile() {
    try {
      const response = await apiServer.get(`${apiBaseUrl}/auth/profileeeee`);
      console.log(response);
      return response.data;
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error fetching profile", err.response?.data);
      throw err;
    }
  }
}
