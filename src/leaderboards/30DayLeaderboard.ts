import { ScoreMember } from "@upstash/redis/types/pkg/commands/zadd";
import { endOfToday, subDays } from "date-fns";

import { incrementLeaderboardItems } from "../upstash";

import { extractHistoryBetweenDates } from "./extractHistoryBetweenDates";

export const rebuild30DayLeaderboard = async (historyKeys: string[]) => {
  const today = endOfToday();
  const thirtyDaysAgo = subDays(today, 30);

  const items: ScoreMember<string>[] = await extractHistoryBetweenDates(
    historyKeys,
    thirtyDaysAgo,
    today
  );

  console.log("stuff", items);

  await incrementLeaderboardItems("leaderboard:30day", items);
};