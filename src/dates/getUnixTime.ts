import { getUnixTime as dateFnsUnix } from "date-fns"

export const getUnixTime = (date: Date | number) => {
  return dateFnsUnix(date);
};
