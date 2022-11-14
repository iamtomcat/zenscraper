import { subDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { getEndOfDayTimeZone } from "../dates/endOfDayTimeZone";
import { getStartOfDayTimeZone } from "../dates/startOfDayTimeZone";
import {
  deleteAndAddItemsToLeaderboard,
  leaderboardKeyBuilder,
} from "../upstash";

import { extractHistoryBetweenDates } from "./extractHistoryBetweenDates";

export const buildYesterday = async (
  companyName: string,
  timezone: string,
  historyKeys: string[]
) => {
  const yesterday = subDays(new Date(), 1);

  const start = getStartOfDayTimeZone(yesterday, timezone);
  const end = getEndOfDayTimeZone(yesterday, timezone);

  console.log("Build Yesterday", start, end);

  const items = await extractHistoryBetweenDates(historyKeys, start, end);

  console.log("stuff", items);

  const yesterdayKey = formatInTimeZone(end, timezone, "yyyy:MM:dd");

  const yesterdayLeaderboardKey = leaderboardKeyBuilder(
    companyName,
    yesterdayKey
  );

  await deleteAndAddItemsToLeaderboard(yesterdayLeaderboardKey, items);
};
