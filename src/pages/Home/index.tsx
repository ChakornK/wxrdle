import { useCallback, useContext, useEffect, useState } from "preact/hooks";
import { WordleWord } from "../../components/WordleWord";
import { SOLUTIONS } from "../../data/wordle/solutions";
import {
  LetterStatus,
  type WordleGuess,
  type Solution,
} from "../../types/wordle";

import "./style.css";
import { Constraint, ConstraintProvider } from "../../provider/Constraint";
import { guessResult, nextWord } from "../../lib/solver";
import { WORDS } from "../../data/wordle/words";
import { Overlay } from "../../components/Overlay";

export const Home = () => {
  const [consented, setConsented] = useState<boolean>(false);

  return (
    <ConstraintProvider>
      <main class="text-text-light dark:text-text-dark h-dvh py-8">
        {consented ? (
          <App />
        ) : (
          <Consent onContinue={() => setConsented(true)} />
        )}
      </main>
    </ConstraintProvider>
  );
};

const Consent = ({ onContinue }: { onContinue: () => void }) => {
  return (
    <div class="flex h-full flex-col items-center justify-center gap-1 px-4 text-center">
      <h1 class="text-4xl font-bold">Wordle Solver</h1>
      <p>Get the best guess suggestions for today's Wordle</p>
      <p>
        Warning: The page will show the Wordle solutions for today and the next
        few days
      </p>
      <button
        onClick={onContinue}
        class="bg-text-light dark:bg-text-dark text-bg-light dark:text-bg-dark mt-4 cursor-pointer rounded-full px-4 py-2"
      >
        Get started
      </button>
    </div>
  );
};

const App = () => {
  const { constraints, setConstraints } = useContext(Constraint);

  const [rawGuesses, setRawGuesses] = useState<string[]>([]);
  const [pendingGuess, setPendingGuess] = useState<string>("");
  const [guesses, setGuesses] = useState<WordleGuess[]>([]);
  const [targetSolution, setTargetSolution] = useState<string>("");

  const [solutionSelectorVisible, setSolutionSelectorVisible] =
    useState<boolean>(false);

  const resetBoard = useCallback(() => {
    setRawGuesses([]);
    setPendingGuess("");
    setConstraints({
      absent: [],
      present: [],
      incorrect: {},
      correct: {},
    });
  }, []);

  useEffect(() => {
    const d = new Date().toISOString().split("T")[0];
    const solution = SOLUTIONS[d];
    setTargetSolution(solution.word);
  }, []);

  useEffect(() => {
    resetBoard();
  }, [targetSolution]);

  useEffect(() => {
    setGuesses(
      rawGuesses
        .slice(0, 6)
        .map((guess) => guessResult(guess, targetSolution) || [])
    );

    if (rawGuesses.length === 0) return;

    const newConstraints = {
      absent: [],
      present: [],
      incorrect: {},
      correct: {},
    };
    for (const word of rawGuesses) {
      const res = guessResult(word, targetSolution);
      for (let i = 0; i < 5; i++) {
        if (res[i].status === LetterStatus.correct) {
          newConstraints.correct[i] = res[i].letter;
          if (newConstraints.present.indexOf(res[i].letter) === -1)
            newConstraints.present.push(res[i].letter);
        } else if (res[i].status === LetterStatus.present) {
          newConstraints.incorrect[i] = [
            ...(newConstraints.incorrect[i] || []),
            res[i].letter,
          ];
          if (newConstraints.present.indexOf(res[i].letter) === -1)
            newConstraints.present.push(res[i].letter);
        } else if (res[i].status === LetterStatus.absent) {
          newConstraints.absent.push(res[i].letter);
        }
      }
    }
    setConstraints(newConstraints);
    console.log(newConstraints);
  }, [rawGuesses]);

  return (
    <>
      <div class="m-auto flex h-full w-fit flex-col items-center gap-6">
        <h1 class="text-4xl font-bold">Wordle Solver</h1>

        <div class="bg-text-light/10 dark:bg-text-dark/10 flex w-full items-center justify-between gap-2 rounded-lg py-4 pl-4 pr-6 text-sm">
          <div>
            <p class="mb-1">
              Solving{" "}
              <b>
                {targetSolution ===
                SOLUTIONS[new Date().toISOString().split("T")[0]].word
                  ? "today"
                  : targetSolution &&
                    new Date(
                      Object.entries(SOLUTIONS).find(
                        ([_, { word }]) =>
                          word.toLowerCase() === targetSolution.toLowerCase()
                      )[0]
                    )
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
          <button
            class="bg-text-light dark:bg-text-dark text-bg-light dark:text-bg-dark cursor-pointer rounded-full px-4 py-2"
            onClick={() => setSolutionSelectorVisible(true)}
          >
            Change
          </button>
        </div>

        <GameBoard guesses={guesses} pending={pendingGuess} />

        <div class="flex items-center gap-2">
          <button
            class="border-text-light dark:border-text-dark cursor-pointer rounded-full border px-4 py-2"
            onClick={(e) => {
              resetBoard();
              (e.target as HTMLButtonElement).blur();
            }}
          >
            Reset
          </button>
          <button
            class="border-text-light dark:border-text-dark cursor-pointer rounded-full border px-4 py-2"
            onClick={(e) => {
              setRawGuesses(rawGuesses.slice(0, -1));
              (e.target as HTMLButtonElement).blur();
            }}
          >
            Undo
          </button>
          <button
            class="bg-text-light dark:bg-text-dark text-bg-light dark:text-bg-dark cursor-pointer rounded-full px-4 py-2"
            onClick={() => {
              if (rawGuesses.length >= 6) return;
              const w = nextWord(constraints);
              setRawGuesses([...rawGuesses, w]);
              setPendingGuess("");
            }}
          >
            Suggest a guess
          </button>
        </div>

        <Keyboard
          onInput={(k) => setPendingGuess((pendingGuess + k).slice(0, 5))}
          onEnter={() => {
            if (pendingGuess.length !== 5) return;
            if (!WORDS.includes(pendingGuess)) return;
            if (rawGuesses.length >= 6) return;
            setRawGuesses([...rawGuesses, pendingGuess]);
            setPendingGuess("");
          }}
          onDelete={() => setPendingGuess(pendingGuess.slice(0, -1))}
        />
      </div>

      <Overlay visible={solutionSelectorVisible}>
        <div class="bg-bg-light dark:bg-bg-dark divide-border-faint-light sm:min-w-sm border-border-faint-light/20 dark:border-border-faint-dark/20 dark:divide-border-faint-dark text-text-light dark:text-text-dark absolute left-1/2 top-1/2 flex h-full w-full -translate-x-1/2 -translate-y-1/2 flex-col divide-y overflow-clip rounded border sm:h-fit sm:max-h-[80vh] sm:w-fit">
          <div class="flex justify-between p-8 py-4 sm:p-4">
            <p class="font-bold uppercase sm:ml-4">Select solution</p>
            <button onClick={() => setSolutionSelectorVisible(false)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20"
                viewBox="0 0 24 24"
                width="20"
              >
                <path
                  fill="currentColor"
                  d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                ></path>
              </svg>
            </button>
          </div>
          <div class="overflow-y-auto p-8">
            <SolutionsList
              onClick={(word) => {
                setTargetSolution(word);
                setSolutionSelectorVisible(false);
              }}
            />
          </div>
        </div>
      </Overlay>
    </>
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

const SolutionsList = ({ onClick }: { onClick: (word: string) => void }) => {
  return (
    <div class="flex flex-col items-stretch gap-4">
      {Object.entries(JSON.parse(JSON.stringify(SOLUTIONS))).map(
        ([date, { id, word }]: [string, Solution]) => (
          <button
            key={date}
            class="bg-text-light/10 dark:bg-text-dark/10 hover:bg-text-light/20 dark:hover:bg-text-dark/20 flex cursor-pointer flex-col gap-2 rounded p-4 transition-colors"
            onClick={() => onClick(word)}
          >
            <p class="text-left">
              <span class="font-bold">{date}</span> - No. {id}
            </p>
            <WordleWord
              guess={word
                .split("")
                .map((letter) => ({ letter, status: LetterStatus.correct }))}
            />
          </button>
        )
      )}
    </div>
  );
};
