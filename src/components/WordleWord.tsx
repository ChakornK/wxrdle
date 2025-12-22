import type { WordleGuess } from "../types/wordle";

const bgColors = [
  "bg-wordle-absent-light dark:bg-wordle-absent-dark",
  "bg-wordle-present-light dark:bg-wordle-present-dark",
  "bg-wordle-correct-light dark:bg-wordle-correct-dark",
];

export const WordleWord = ({ guess }: { guess: WordleGuess }) => {
  return (
    <div class="flex gap-[0.25em]">
      {guess.map((letter, i) => (
        <div
          key={i}
          class={`flex h-[2em] w-[2em] items-center justify-center font-bold uppercase ${
            bgColors[letter.status]
          }`}
        >
          {letter.letter}
        </div>
      ))}
    </div>
  );
};
