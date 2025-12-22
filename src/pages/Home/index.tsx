import { useState } from "preact/hooks";
import { WordleWord } from "../../components/WordleWord";
import { SOLUTIONS } from "../../data/wordle/solutions";
import { LetterStatus, type Solution } from "../../types/wordle";

import "./style.css";

export const Home = () => {
  return (
    <main class="text-text-light dark:text-text-dark flex h-full flex-col items-center gap-6 p-8">
      <h1 class="text-4xl font-bold">Wordle Solutions</h1>

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
    </main>
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
      <div
        class={`select-none text-2xl transition-all ${
          revealed ? "" : "blur-sm"
        }`}
      >
        <WordleWord
          guess={word
            .split("")
            .map((letter) => ({ letter, status: LetterStatus.correct }))}
        />
      </div>
    </div>
  );
};
