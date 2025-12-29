import { useEffect, useState } from "preact/hooks";
import { LetterStatus, type WordleGuess } from "../types/wordle";
import { stagger, useAnimate } from "motion/react";

const variants = [
  "text-text-dark bg-wordle-absent-light dark:bg-wordle-absent-dark",
  "text-text-dark bg-wordle-present-light dark:bg-wordle-present-dark",
  "text-text-dark bg-wordle-correct-light dark:bg-wordle-correct-dark",
  "border border-2 bg-bg-light dark:bg-bg-dark border-border-light dark:border-border-dark",
  "border border-2 bg-bg-light dark:bg-bg-dark border-border-faint-light dark:border-border-faint-dark",
];

export const WordleWord = ({ guess }: { guess: WordleGuess }) => {
  const [scope, animate] = useAnimate();
  const [pending, setPending] = useState<boolean>(
    guess.every((l) => l.status === LetterStatus.pending)
  );
  useEffect(() => {
    if (!pending) {
      animate(
        ".letter-front",
        {
          scaleY: [1, 0, 0, 1],
          opacity: [1, 1, 0, 0],
        },
        {
          delay: stagger(0.25),
          duration: 0.5,
          times: [0, 0.5, 0.5, 1],
        }
      );
      animate(
        ".letter-back",
        {
          scaleY: [1, 0, 1],
        },
        {
          delay: stagger(0.25),
          duration: 0.5,
        }
      );
    }
  }, [pending]);

  return (
    <div class="flex gap-[0.25em]" ref={scope}>
      {Array.from({ length: 5 })
        .map((_, i) => guess[i] || { letter: "", status: LetterStatus.pending })
        .map((letter, i) => (
          <WordleLetter key={i} letter={letter.letter} status={letter.status} />
        ))}
    </div>
  );
};

const WordleLetter = ({
  letter,
  status,
}: {
  letter: string;
  status: LetterStatus;
}) => {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (status === LetterStatus.pending && letter !== "") {
      animate(
        scope.current,
        { scale: [1, 1.2, 1] },
        { duration: 0.1, times: [0, 0.3, 1] }
      );
    }
  }, [letter]);

  return (
    <div class="relative h-[2em] w-[2em] font-bold uppercase" ref={scope}>
      <div
        class={`letter-back absolute inset-0 flex items-center justify-center ${variants[status]}`}
      >
        {letter}
      </div>
      <div
        class={`letter-front absolute inset-0 flex items-center justify-center ${
          variants[
            letter == "" ? LetterStatus.pending + 1 : LetterStatus.pending
          ]
        }`}
      >
        {letter}
      </div>
    </div>
  );
};
