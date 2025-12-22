export type Solution = {
  id: number;
  word: string;
};
export type Solutions = Record<string, Solution>;

export enum LetterStatus {
  "absent",
  "present",
  "correct",
}
export type WordleLetter = {
  letter: string;
  status: LetterStatus;
};
export type WordleGuess = WordleLetter[];
