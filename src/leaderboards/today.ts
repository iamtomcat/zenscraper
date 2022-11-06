import { ScoreMember } from "@upstash/redis/types/pkg/commands/zadd";

import { SummedUserScore } from "../scrape";
import { deleteAndAddItemsToLeaderboard, deleteKey } from "../upstash";

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

  const key = todayLeaderBoardKey(companyName);

  await deleteAndAddItemsToLeaderboard(key, scoreMembers);
};

const todayLeaderBoardKey = (companyName: string) =>
  `${companyName}:leaderboard:today`;
