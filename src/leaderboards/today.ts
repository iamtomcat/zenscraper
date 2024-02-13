import { ScoreMember } from "@upstash/redis";

import { SummedUserScore } from "../scrape";
import {
  deleteAndAddItemsToLeaderboard,
  leaderboardKeyBuilder,
} from "../upstash";

export const buildTodayLeaderBoard = async (
  companyName: string,
  statsForToday: SummedUserScore
) => {
  const scoreMembers = Object.entries(statsForToday).map(([name, score]) => {
    return {
      member: name,
      score,
    } as ScoreMember<string>;
  });

  const key = leaderboardKeyBuilder(companyName, "today");

  await deleteAndAddItemsToLeaderboard(key, scoreMembers);
};
