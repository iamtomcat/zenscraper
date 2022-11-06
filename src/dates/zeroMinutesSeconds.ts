import { format } from "date-fns";

export const getZeroedMinutesAndSeconds = (instant: number | Date): Date => {
  const zeroedMinutesAndSeconds = format(instant, "yyyy-MM-dd'T'HH:00:00XXX");
  return new Date(zeroedMinutesAndSeconds);
};
