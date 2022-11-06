import { launchChromium } from "playwright-aws-lambda";
import { Page } from "playwright-core";
import { format } from "date-fns";

import { calculateTableScore, sumUserScores } from "./scoring";

interface Score {
  rank: number;
  name: string;
  score: number;
}

interface ProgramOption {
  title: string;
  selected: boolean;
}

type ScoreData = { title: string; results: Score[] }[];

type RankName = [rank: number, name: string];

export interface SummedUserScore {
  [userName: string]: number;
}

export interface ScraperOptions {
  headless: boolean;
}

export const scraper = async (
  ZenPlannerURL: string,
  date: Date,
  options?: ScraperOptions
) => {
  const browser = await launchChromium(options);

  const page = await browser.newPage();

  console.log("date", zenPlannerDate(date));

  await page.goto(`${ZenPlannerURL}?date=${zenPlannerDate(date)}`);

  const programOptions = await getProgramOptions(page);

  const summedUserScores: SummedUserScore = {};

  for (const programOption of programOptions) {
    if (!programOption.selected) {
      await selectProgramOption(page, programOption);
    }

    console.log(`Parsing option ${programOption.title}`);

    const parsedTables = await getRankTables(page);

    console.log("Tables", parsedTables);

    const userScores = calculateScoresForAllTables(parsedTables);

    console.log("User Scores", userScores);

    // TODO: normalize scores
    for (const [key, scores] of Object.entries(userScores)) {
      summedUserScores[key] = sumUserScores(scores);
    }
  }

  console.log("ranks", summedUserScores);

  await page.waitForTimeout(2000);
  await browser.close();

  return summedUserScores;
};

const selectProgramOption = (page: Page, programOption: ProgramOption) => {
  console.log(`Switching page to ${programOption.title}`);

  return Promise.all([
    page.waitForNavigation(),
    page
      .locator('select[name="objectid"]')
      .selectOption({ label: programOption.title }),
  ]);
};

const calculateScoresForAllTables = (scoreData: ScoreData) => {
  const userScores: { [userName: string]: number[] } = {};

  for (const table of scoreData) {
    for (const userScore of table.results) {
      if (!userScores[userScore.name]) {
        userScores[userScore.name] = [];
      }

      userScores[userScore.name].push(
        calculateTableScore(userScore.rank, table.results.length)
      );
    }
  }

  return userScores;
};

const getProgramOptions = async (page: Page) => {
  const programOptions = await page
    .locator('optgroup[label="Program"] > option')
    .evaluateAll((options: HTMLElement[]) =>
      options
        .filter((option): option is HTMLElement => !!option)
        .map(
          (option) =>
            ({
              title: option.textContent!.trim(),
              selected: option.attributes.getNamedItem("selected") !== null,
            } as ProgramOption)
        )
    );

  return programOptions;
};

const getRankTables = async (page: Page) => {
  const skillBoxCount = await page.locator(".skillBox").count();

  console.log(`Found ${skillBoxCount} tables on page`);

  const skillBox = await page.locator(".skillBox").evaluateAll((tables) =>
    tables.map((table) => ({
      title: table.getElementsByTagName("h2")[0].innerText,
      results: Array.from(table.getElementsByClassName("personResult")).map(
        (item: Element) => {
          const [rank, name] = item.firstElementChild?.innerHTML
            .replace(/\n/g, "")
            .split("&nbsp;") as RankName;

          return {
            rank,
            name,
            score: 0,
          } as Score;
        }
      ),
    }))
  );

  return skillBox as ScoreData;
};

// Needs to be 2022-09-26 for zenplanner
const zenPlannerDate = (date: Date) => {
  return format(date, "yyyy-MM-dd");
};
