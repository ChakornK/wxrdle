import { LetterStatus, type WordleGuess } from "../types/wordle";

const variants = [
  "text-text-dark bg-wordle-absent-light dark:bg-wordle-absent-dark",
  "text-text-dark bg-wordle-present-light dark:bg-wordle-present-dark",
  "text-text-dark bg-wordle-correct-light dark:bg-wordle-correct-dark",
  "border border-2 border-border-light dark:border-border-dark",
  "border border-2 border-border-faint-light dark:border-border-faint-dark",
];

export const WordleWord = ({ guess }: { guess: WordleGuess }) => {
  return (
    <div class="flex gap-[0.25em]">
      {Array.from({ length: 5 })
        .map((_, i) => guess[i] || { letter: "", status: LetterStatus.pending })
        .map((letter, i) => (
          <div
            key={i}
            class={`flex h-[2em] w-[2em] items-center justify-center font-bold uppercase ${
              variants[
                letter.letter == "" ? LetterStatus.pending + 1 : letter.status
              ]
            }`}
          >
            {letter.letter}
          </div>
        ))}
    </div>
  );
};
