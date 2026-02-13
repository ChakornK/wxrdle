import { writeFileSync } from "node:fs";
import { Solutions } from "../types/wordle";
import { SOLUTIONS } from "../data/wordle/solutions";

const solutions = SOLUTIONS as Solutions;

const getApiUrl = (date: string) =>
  `https://www.nytimes.com/svc/wordle/v2/${date}.json`;
const dateFromTimestamp = (timestamp = Date.now()) =>
  new Date(timestamp).toISOString().split("T")[0];

const LOW_DATE = -1;
const HIGH_DATE = 5;
const TIMESTAMP_DAY = 1000 * 60 * 60 * 24;

let newSolutions = {};
for (let offset = LOW_DATE; offset <= HIGH_DATE; offset++) {
  const date = dateFromTimestamp(Date.now() + offset * TIMESTAMP_DAY);
  if (solutions[date]) {
    newSolutions[date] = solutions[date];
  } else {
    const response = await fetch(getApiUrl(date));
    if (response.ok) {
      const data = await response.json();
      const { days_since_launch, solution } = data;
      newSolutions[date] = {
        id: days_since_launch,
        word: solution,
      };
      console.log(`Fetched solution for ${date}: ${data.solution}`);
    } else {
      console.warn(`No solution found for ${date}`);
    }
  }
}

const newSolutionsCode = `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.
export const SOLUTIONS = ${JSON.stringify(newSolutions, null, 2)};`;

writeFileSync(
  new URL("../data/wordle/solutions.ts", import.meta.url),
  newSolutionsCode,
);

export {};
