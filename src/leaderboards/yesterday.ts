import { format, startOfYesterday } from "date-fns";
import { getEndOfDayTimeZone } from "../dates/endOfDayTimeZone";
import { getStartOfDayTimeZone } from "../dates/startOfDayTimeZone";

import { incrementLeaderboardItems, keyBuilder } from "../upstash";

import { extractHistoryBetweenDates } from "./extractHistoryBetweenDates";

export const buildYesterday = async (
  companyName: string,
  historyKeys: string[]
) => {
  const start = getStartOfDayTimeZone(startOfYesterday(), "America/Vancouver");
  const end = getEndOfDayTimeZone(startOfYesterday(), "America/Vancouver");

  console.log("Build Yesterday", start, end);

  const items = await extractHistoryBetweenDates(historyKeys, start, end);

  console.log("stuff", items);

  const yesterdayKey = format(end, "yyyy:MM:dd");

  await incrementLeaderboardItems(
    keyBuilder([companyName, "leaderboard", yesterdayKey]),
    items
  );
};
