import { ScoreMember } from "@upstash/redis";
import { endOfMonth, format, startOfMonth } from "date-fns";

import { leaderboardKeyBuilder } from "../upstash";
import { incrementLeaderboardItems } from "../upstash/upstash";

import { extractHistoryBetweenDates } from "./extractHistoryBetweenDates";

export const setupMonthlyLeaderboard = async (
  companyName: string,
  historyKeys: string[]
) => {
  const today = new Date();

  const endOfCurrentMonth = endOfMonth(today);
  const startOfCurrentMonth = startOfMonth(today);

  const items: ScoreMember<string>[] = await extractHistoryBetweenDates(
    historyKeys,
    startOfCurrentMonth,
    endOfCurrentMonth
  );

  console.log("stuff", items);

  const monthYearName = format(today, "yyyy:MM");

  const monthKey = leaderboardKeyBuilder(companyName, monthYearName);

  await incrementLeaderboardItems(monthKey, items);
};
