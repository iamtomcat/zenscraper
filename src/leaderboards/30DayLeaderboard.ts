import { ScoreMember } from "@upstash/redis/types/pkg/commands/zadd";
import { endOfToday, subDays } from "date-fns";
import {
  deleteAndAddItemsToLeaderboard,
  leaderboardKeyBuilder,
} from "../upstash";

import { extractHistoryBetweenDates } from "./extractHistoryBetweenDates";

export const rebuild30DayLeaderboard = async (
  companyName: string,
  historyKeys: string[]
) => {
  const today = endOfToday();
  const thirtyDaysAgo = subDays(today, 30);

  const items: ScoreMember<string>[] = await extractHistoryBetweenDates(
    historyKeys,
    thirtyDaysAgo,
    today
  );

  console.log("stuff", items);

  const key = leaderboardKeyBuilder(companyName, "30day");

  await deleteAndAddItemsToLeaderboard(key, items);
};
