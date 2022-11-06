import { format, startOfYesterday } from "date-fns";
import { getEndOfDayTimeZone } from "../dates/endOfDayTimeZone";
import { getStartOfDayTimeZone } from "../dates/startOfDayTimeZone";

import { incrementLeaderboardItems } from "../upstash";

import { extractHistoryBetweenDates } from "./extractHistoryBetweenDates";

export const buildYesterday = async (
  companyName: string,
  historyKeys: string[]
) => {
  console.log("Build Yesterday");

  const start = getStartOfDayTimeZone(startOfYesterday(), "America/Vancouver");
  const end = getEndOfDayTimeZone(startOfYesterday(), "America/Vancouver");

  const items = await extractHistoryBetweenDates(historyKeys, start, end);

  console.log("stuff", items);

  const yesterdayKey = format(end, "yyyy:MM:dd");

  incrementLeaderboardItems(`${companyName}leaderboard:${yesterdayKey}`, items);
};
