import { apiClient } from "./client";

interface HolidayCheckResponse {
  is_holiday: boolean;
  holiday?: {
    date: string;
    name: string;
    type: string;
  };
}

export async function checkHoliday(
  date: string,
): Promise<HolidayCheckResponse> {
  const { data } = await apiClient.get<HolidayCheckResponse>(
    "/external/holidays/check/",
    {
      params: { date },
    },
  );
  return data;
}
