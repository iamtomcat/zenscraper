// +3 points for logging a score (any score)
// +1 point for every person you beat that day
// total points divided by number of scores / measures that day
// Auto pulls from previous 30 days
// Pulls at midnight that night so scores only count if entered before that (edited)

export interface TableScoreData {
  score: number;
  totalPeople: number;
}

export const calculateTableScore = (position: number, totalPeople: number) => {
  let score = 3;

  score += totalPeople - position + 1;

  return { score, totalPeople } as TableScoreData;
};

export const sumUserScores = (scores: TableScoreData[]) => {
  const totalPeople = scores.reduce(
    (previousValue, current) => previousValue + current.totalPeople,
    0
  );

  const normalizedScore = scores.reduce(
    (previousValue, current) =>
      previousValue + current.score * (current.totalPeople / totalPeople),
    0
  );

  const averagedScore =
    scores.reduce(
      (previousValue, current) => previousValue + current.score,
      0
    ) / scores.length;

  console.log(`Normalized score ${normalizedScore} averaged score: ${averagedScore}`);

  console.log("Scores are", scores);

  return normalizedScore;
};
