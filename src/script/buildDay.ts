import { set } from "date-fns";
import pino from "pino";

import { scrapeDay } from "../scrapeDay";
import { UserHistoryData } from "../upstash/upstash";

const logger = pino();

const buildDay = async (date: {
  date: number;
  month: number;
  year: number;
}) => {
  const dateToCheck = set(new Date(), {
    ...date,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });

  const statsForDay = await scrapeDay(dateToCheck, true, logger);

  const historicalData = Object.entries(statsForDay.userScores).map(([name, score]) => {
    return {
      name,
      score,
    } as UserHistoryData;
  }).sort((a, b) => b.score - a.score);

  logger.info("Stats For Today %o", historicalData);
};

buildDay({
  date: 2,
  month: 1,
  year: 2024,
}).then(() => {});
