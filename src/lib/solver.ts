import { WORDS } from "../data/wordle/words";
import { LetterStatus, WordleGuess } from "../types/wordle";

export type Constraints = {
  absent: string[];
  present: string[];
  incorrect: Record<number, string[]>;
  correct: Record<number, string>;
};

export const nextWord = (constraints: Constraints) => {
  let w = WORDS.filter(
    (word) => !constraints.absent.some((l) => word.includes(l))
  );
  if (constraints.present.length > 0) {
    w = w.filter((word) => constraints.present.every((l) => word.includes(l)));
  }
  w = w
    .filter((word) =>
      word
        .split("")
        .every((l, i) => !(constraints.incorrect[i] || []).includes(l))
    )
    .filter((word) =>
      word
        .split("")
        .every((l, i) =>
          constraints.correct[i] ? constraints.correct[i] === l : true
        )
    );

  if (w.length == 1) {
    return w[0];
  }

  const freq = letterFreq(w);

  const lettersByFreq = Object.entries(freq).filter(
    ([l]) => !constraints.present.includes(l)
  );
  if (lettersByFreq.length == 0) {
    return w[Math.floor(Math.random() * w.length)];
  }

  const candidates = WORDS.filter((word) =>
    word.split("").some((l) => lettersByFreq.find(([lf]) => lf === l))
  );
  const candidatesRanked = candidates
    .map((word) => {
      return [
        word,
        [...new Set(word.split(""))]
          .map(
            (l) => (lettersByFreq.find(([lf]) => lf === l) || [0, -1])[1] + 1
          )
          .reduce((a, b) => a + b, 0),
      ];
    })
    .sort((a: [string, number], b: [string, number]) => b[1] - a[1]) as [
    string,
    number
  ][];

  const maxScore = candidatesRanked.reduce((a, b) => Math.max(a, b[1]), 0);

  const bestCandidates = candidatesRanked.filter((c) => c[1] === maxScore);

  if (bestCandidates.length == 1) return bestCandidates[0][0];

  const allWordsLetterFreq = letterFreq(WORDS);
  const bestCandidateByFreq = bestCandidates
    .map(([word]) => word)
    .map((word) => {
      return [
        word,
        [...new Set(word.split(""))]
          .map(
            (l) =>
              (Object.entries(allWordsLetterFreq).find(([lf]) => lf === l) || [
                0, -1,
              ])[1] + 1
          )
          .reduce((a, b) => a + b, 0),
      ];
    })
    .sort((a: [string, number], b: [string, number]) => b[1] - a[1]) as [
    string,
    number
  ][];
  return bestCandidateByFreq[0][0];
};

const letterFreq = (words: string[]) => {
  const freq: Record<string, number> = {};
  for (const word of words) {
    for (const letter of word.split("")) {
      freq[letter] = (freq[letter] || 0) + 1;
    }
  }
  return freq;
};

export const guessResult = (guess: string, solution: string) => {
  const letterCount = {};
  for (let i = 0; i < 5; i++) {
    letterCount[solution[i]] = (letterCount[solution[i]] || 0) + 1;
  }
  const result: WordleGuess = Array(guess.length).fill({});
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === solution[i]) {
      result[i] = { letter: guess[i], status: LetterStatus.correct };
      letterCount[guess[i]] = letterCount[guess[i]] - 1;
    }
  }
  for (let i = 0; i < guess.length; i++) {
    if (!result[i].letter) {
      if (solution.includes(guess[i]) && letterCount[guess[i]] > 0) {
        result[i] = { letter: guess[i], status: LetterStatus.present };
        letterCount[guess[i]] = letterCount[guess[i]] - 1;
      } else {
        result[i] = { letter: guess[i], status: LetterStatus.absent };
      }
    }
  }
  return result;
};
