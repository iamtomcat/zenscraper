// +3 points for logging a score (any score)
// +1 point for every person you beat that day
// total points divided by number of scores / measures that day
// Auto pulls from previous 30 days
// Pulls at midnight that night so scores only count if entered before that (edited)

export const calculateTableScore = (position: number, totalPeople: number) => {
  let score = 3;

  score += totalPeople - position + 1;

  return score;
};

export const sumUserScores = (scores: number[]) => {
  return scores.reduce((previousValue, current) => previousValue + current, 0) / scores.length;
};
