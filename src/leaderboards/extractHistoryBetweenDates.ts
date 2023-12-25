import { ScoreMember } from "@upstash/redis";

import { getUserHistoryScores } from "../upstash/upstash";

export const extractHistoryBetweenDates = async (
  historyKeys: string[],
  startDate: Date,
  endDate: Date
) => {
  const items: ScoreMember<string>[] = [];

  for (const key of historyKeys) {
    const userHistoryScores = await getUserHistoryScores(
      key,
      startDate,
      endDate
    );

    console.log("scores", userHistoryScores);

    let totalScore = 0;
    let name = "";
    for (const score of userHistoryScores) {
      totalScore += score.score;
      if (name === "") {
        name = score.name;
      }
    }

    if (name !== "") {
      items.push({ member: name, score: totalScore });
    }
  }

  return items;
};
