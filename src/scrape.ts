import { chromium } from "playwright";
import { format } from "date-fns";

import { calculateTableScore, sumUserScores } from "./scoring";

interface Score {
  rank: number;
  name: string;
  score: number;
}

type ScoreData = [title: string, scores: Score[]];

type RankName = [rank: number, name: string];

const ZenPlannerURL = "https://raincityathletics.sites.zenplanner.com/workout-leaderboard-daily-results.cfm";

export const scraper = async (date: Date) => {
  const browser = await chromium.launch({
    headless: false
  });

  const page = await browser.newPage();

  console.log('date', formatDate(date));

  await page.goto(`${ZenPlannerURL}?date=${formatDate(date)}`);

  const parsedTables = await page.$$eval(".skillBox", (scoreTables) => {
    const out: { [ title: string ]: Score[] } = {};

    for (const scoreTable of scoreTables) {
      const title = scoreTable.getElementsByTagName("h2")[0].innerText;

      const resultItems = scoreTable.getElementsByClassName("personResult");

      const parsedScores = Array.from(resultItems).map((result) => {
        const [ rank, name ] = result.firstElementChild?.innerHTML.replaceAll("\n", "").split("&nbsp;") as RankName;

        return {
          rank,
          name,
          score: 0
        } as Score
      })

      out[title] = parsedScores;
    }

    return out;
  });

  const userScores: { [ userName: string]: number[] } = {};

  for (const [_key, table] of Object.entries(parsedTables)) {
    for (const userScore of table) {
      if (!userScores[userScore.name]) {
        userScores[userScore.name] = [];
      }

      userScores[userScore.name].push(calculateTableScore(userScore.rank, table.length))
    }
  }

  const summedUserScores: { [ userName: string]: number } = {};

  // TODO: normalize scores
  for (const [key, scores] of Object.entries(userScores)) {
    summedUserScores[key] = sumUserScores(scores);
  }

  // const tableScores = Object.keys(parsedTables).map((tableName) => {
  //   return


  //   return {
  //     ...user,
  //     score: calculateScore(user.rank, parsedUsers.length),
  //   }
  // })

  console.log('ranks', userScores, summedUserScores);

  await page.waitForTimeout(2000);
  await browser.close();

  return summedUserScores;
}

// Needs to be 2022-09-26 for zenplanner
const formatDate = (date: Date) => {
  return format(date, "yyyy-MM-dd");
};
