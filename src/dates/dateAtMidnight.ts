import { formatInTimeZone } from "date-fns-tz";

export const getInstanceOfDateAtMidnight = (
  instant: number | Date,
  tz: string
): Date => {
  const midnightAtTimezoneString = formatInTimeZone(
    instant,
    tz,
    "yyyy-MM-dd'T'00:00:00XXX"
  );
  return new Date(midnightAtTimezoneString);
};
