import { format, subDays } from "date-fns";
import { getEndOfDayTimeZone } from "../dates/endOfDayTimeZone";
import { getStartOfDayTimeZone } from "../dates/startOfDayTimeZone";
import { leaderboardKeyBuilder } from "../upstash";

import { incrementLeaderboardItems } from "../upstash/upstash";

import { extractHistoryBetweenDates } from "./extractHistoryBetweenDates";

export const buildYesterday = async (
  companyName: string,
  historyKeys: string[]
) => {
  const yesterday = subDays(new Date(), 1);

  const start = getStartOfDayTimeZone(yesterday, "America/Vancouver");
  const end = getEndOfDayTimeZone(yesterday, "America/Vancouver");

  console.log("Build Yesterday", start, end);

  const items = await extractHistoryBetweenDates(historyKeys, start, end);

  console.log("stuff", items);

  const yesterdayKey = format(end, "yyyy:MM:dd");

  const yesterdayLeaderboardKey = leaderboardKeyBuilder(companyName, yesterdayKey);

  await incrementLeaderboardItems(
    yesterdayLeaderboardKey,
    items
  );
};
