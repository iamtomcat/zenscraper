import { formatInTimeZone } from "date-fns-tz";

export const getEndOfDayTimeZone = (
  instant: number | Date,
  tz: string
): Date => {
  const midnightAtTimezoneString = formatInTimeZone(
    instant,
    tz,
    "yyyy-MM-dd'T'23:00:00XXX"
  );
  return new Date(midnightAtTimezoneString);
};
