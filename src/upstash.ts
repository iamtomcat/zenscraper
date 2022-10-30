import { Redis } from "@upstash/redis/with-fetch";
import { ScoreMember } from "@upstash/redis/types/pkg/commands/zadd";

const redis = new Redis({
  url: "https://usw2-kind-cub-30211.upstash.io",
  token: "AXYDASQgZGFhMWJkMDctNGNmZi00NzQzLTg1MjQtOWQyMmQwMzc5NWFiMjQwY2ZiMzQ3YWE3NDE0ZmI2MTA0NjEzOTQ3MGQzNjE=",
});

export const incrementLeaderboardItems = async (leaderboard: string, scores: ScoreMember<string>[]) => {
  for (const score of scores) {
    await redis.zincrby(leaderboard, score.score, score.member)
  }
}

export const setupScoresAndMembers = (): ScoreMember<string>[] => {
  return [{ member: "", score: 0}];
};

// export const updateUserHash = async ( date: Date, name: string, scoreForDay: number) => {
//   await redis.hsetnx(`user:${name}`, hashDateKey(date), scoreForDay)
// };

// const hashDateKey = (date: Date) => {
//   return format(date, "dd-MM-yyyy");
// }

export interface UserHistoryData {
  name: string;
  score: number;
}

// TODO: pass in dd-MM-yyyy date to be used as a key
export const addToUserHistoricalData = async (date: Date, userData: UserHistoryData[]) => {
  for (const data of userData) {
    const name = data.name.replace(" ", "-");

    await redis.zadd<UserHistoryData>(`user:${name}:history`, { nx: true }, { score: date.getTime(), member: data })
  }
};

export const getUserHistoryKeys = () => {
  return redis.keys("user:*:history");
}

export const getUserHistoryScores = (key: string, startDate: Date, endDate: Date) => {
  return redis.zrange<UserHistoryData[]>(key, startDate.getTime(), endDate.getTime(), { byScore: true });
}
