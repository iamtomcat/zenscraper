import { Redis } from "@upstash/redis/with-fetch";
import { ScoreMember } from "@upstash/redis/types/pkg/commands/zadd";

const redis = new Redis({
  url: "https://usw2-kind-cub-30211.upstash.io",
  token:
    "AXYDASQgZGFhMWJkMDctNGNmZi00NzQzLTg1MjQtOWQyMmQwMzc5NWFiMjQwY2ZiMzQ3YWE3NDE0ZmI2MTA0NjEzOTQ3MGQzNjE=",
});

export const incrementLeaderboardItems = async (
  leaderboard: string,
  scores: ScoreMember<string>[]
) => {
  for (const score of scores) {
    await redis.zincrby(leaderboard, score.score, score.member);
  }
};

export const addItemsToLeaderboard = (
  leaderboard: string,
  scores: ScoreMember<string>[],
) => {
  const scoreSlice = scores.slice(1);
  return redis.zadd<string>(leaderboard, scores[0], ...scoreSlice);
};

export const deleteKey = async (key: string) => {
  return redis.del(key);
}

export interface UserHistoryData {
  name: string;
  score: number;
}

export const userHistoryKey = (userName: string) => {
  return `user:${userName}:history`;
};

export const addToUserHistoricalData = async (
  date: Date,
  userData: UserHistoryData[]
) => {
  const pipeline = redis.pipeline();

  for (const data of userData) {
    const name = data.name.replace(" ", "-");

    pipeline.zadd<UserHistoryData>(
      userHistoryKey(name),
      { nx: true },
      { score: date.getTime(), member: data }
    );
  }

  await pipeline.exec();
};

const usersKey = (companyName: string) => {
  return [companyName, "users"].join(":");
};

export const addUsersToSet = (companyName: string, userNames: string[]) => {
  const key = usersKey(companyName);

  return redis.sadd(key, userNames);
};

export const getCurrentUsersList = (companyName: string) => {
  const key = usersKey(companyName);

  return redis.smembers(key);
};

export const getUserHistoryScores = (
  key: string,
  startDate: Date,
  endDate: Date
) => {
  return redis.zrange<UserHistoryData[]>(
    key,
    endDate.getTime(),
    startDate.getTime(),
    { byScore: true, rev: true }
  );
};
