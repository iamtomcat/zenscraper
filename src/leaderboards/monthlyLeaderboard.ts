import { ScoreMember } from "@upstash/redis/types/pkg/commands/zadd";
import { endOfMonth, format, startOfMonth } from "date-fns";

import { incrementLeaderboardItems } from "../upstash";

import { extractHistoryBetweenDates } from "./extractHistoryBetweenDates";

export const setupMonthlyLeaderboard = async (historyKeys: string[]) => {
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

  incrementLeaderboardItems(`leaderboard:${monthYearName}`, items);
};