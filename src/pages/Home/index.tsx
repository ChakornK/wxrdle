import { useEffect, useState } from "preact/hooks";
import { WordleWord } from "../../components/WordleWord";
import { SOLUTIONS } from "../../data/wordle/solutions";
import {
  LetterStatus,
  type WordleGuess,
  type Solution,
} from "../../types/wordle";

import "./style.css";
import { ConstraintProvider } from "../../provider/Constraint";
import { guessResult } from "../../lib/solver";
import { WORDS } from "../../data/wordle/words";

export const Home = () => {
  const [rawGuesses, setRawGuesses] = useState<string[]>([]);
  const [pendingGuess, setPendingGuess] = useState<string>("");
  const [guesses, setGuesses] = useState<WordleGuess[]>([]);
  const [targetSolution, setTargetSolution] = useState<string>("");

  useEffect(() => {
    const d = new Date().toISOString().split("T")[0];
    const solution = SOLUTIONS[d];
    setTargetSolution(solution.word);
  }, []);

  useEffect(() => {
    setGuesses(
      rawGuesses.map((guess) => guessResult(guess, targetSolution) || [])
    );
  }, [rawGuesses, targetSolution]);

  return (
    <ConstraintProvider>
      <main class="text-text-light dark:text-text-dark h-full py-8">
        <div class="m-auto flex h-full w-fit flex-col items-center gap-6">
          <h1 class="text-4xl font-bold">Wordle Solutions</h1>

          <div class="bg-text-light/10 dark:bg-text-dark/10 flex w-full items-center justify-between gap-2 rounded-lg py-4 pl-4 pr-6 text-sm">
            <div>
              <p class="mb-1">
                Solving{" "}
                <b>
                  {targetSolution ===
                  SOLUTIONS[new Date().toISOString().split("T")[0]].word
                    ? "today"
                    : new Date()
                        .toDateString()
                        .split(" ")
                        .slice(1, 3)
                        .join(" ")}
                </b>
                's wordle
              </p>
              <WordleWord
                guess={targetSolution
                  .split("")
                  .map((letter) => ({ letter, status: LetterStatus.correct }))}
              />
            </div>
            <button class="bg-text-light dark:bg-text-dark text-bg-light dark:text-bg-dark cursor-pointer rounded-full px-4 py-2">
              Change
            </button>
          </div>

          <GameBoard guesses={guesses} pending={pendingGuess} />
          <Keyboard
            onInput={(k) => setPendingGuess((pendingGuess + k).slice(0, 5))}
            onEnter={() => {
              if (pendingGuess.length !== 5) return;
              if (!WORDS.includes(pendingGuess)) return;
              setRawGuesses([...rawGuesses, pendingGuess]);
              setPendingGuess("");
            }}
            onDelete={() => setPendingGuess(pendingGuess.slice(0, -1))}
          />
        </div>
      </main>
    </ConstraintProvider>
  );
};

const GameBoard = ({
  guesses,
  pending,
}: {
  guesses: WordleGuess[];
  pending: string;
}) => {
  return (
    <div class="flex flex-col gap-[0.25em] text-2xl">
      {guesses.map((guess, i) => (
        <WordleWord key={i} guess={guess} />
      ))}
      {pending && (
        <WordleWord
          guess={pending
            .split("")
            .map((l) => ({ letter: l, status: LetterStatus.pending }))}
        />
      )}
      {Array.from({ length: (pending ? 5 : 6) - guesses.length }).map(
        (_, i) => (
          <WordleWord guess={[]} />
        )
      )}
    </div>
  );
};

const keys = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];
const Keyboard = ({
  onInput,
  onEnter,
  onDelete,
}: {
  onInput: (key: string) => void;
  onEnter: () => void;
  onDelete: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        onEnter();
      } else if (e.key === "Backspace") {
        onDelete();
      } else {
        if (keys.flat().includes(e.key.toLowerCase())) onInput(e.key);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onEnter, onDelete, onInput]);

  return (
    <div class="flex flex-col items-center gap-[0.5em]">
      {keys.map((row, i) => (
        <div
          class="*:flex *:cursor-pointer *:bg-surface-light dark:*:bg-surface-dark *:rounded *:items-center *:justify-center *:font-bold *:h-14 *:uppercase flex items-stretch gap-[0.375em]"
          key={i}
        >
          {i === keys.length - 1 && (
            <button class="w-12 text-[0.625em] sm:w-16" onClick={onEnter}>
              enter
            </button>
          )}
          {row.map((key, j) => (
            <button key={j} class="w-6 sm:w-10" onClick={() => onInput(key)}>
              {key}
            </button>
          ))}
          {i === keys.length - 1 && (
            <button class="w-12 sm:w-16" onClick={onDelete}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20"
                viewBox="0 0 24 24"
                width="20"
              >
                <path
                  fill="currentColor"
                  d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"
                />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

const SolutionsList = () => {
  return (
    <div class="flex flex-col items-center gap-8">
      {Object.entries(JSON.parse(JSON.stringify(SOLUTIONS))).map(
        ([date, { id, word }]: [string, Solution]) => (
          <div key={date} class="flex flex-col gap-2">
            <p>
              <span class="font-bold">{date}</span> - No. {id}
            </p>
            <Answer word={word} />
          </div>
        )
      )}
    </div>
  );
};

const Answer = ({ word }: { word: string }) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <div class="*:col-start-1 *:row-start-1 grid">
      {!revealed && (
        <div class="flex h-full items-center justify-center">
          <button
            class="bg-bg-light dark:bg-bg-dark z-10 cursor-pointer rounded-full px-4 py-2 text-sm"
            onClick={() => setRevealed(!revealed)}
          >
            {revealed ? "Hide" : "Reveal"} Answer
          </button>
        </div>
      )}
      <div class={`select-none text-2xl ${revealed ? "" : "blur-sm"}`}>
        <WordleWord
          guess={word
            .split("")
            .map((letter) => ({ letter, status: LetterStatus.correct }))}
        />
      </div>
    </div>
  );
};
