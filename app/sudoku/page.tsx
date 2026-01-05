"use client";

import SudokuGrid from "@/components/Sudoku/sudoku-grid";
import { useState } from "react";

const Page = () => {
  const [selected, setSelected] = useState<number[] | null>(null);
  const board = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => Math.floor(Math.random() * 9) + 1)
  );
  const puzzle = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => Math.floor(Math.random() * 9) + 1)
  );

  return (
    <main className="min-h-screen w-full flex flex-col justify-center items-center bg-[#242424]">
      <section className="text-center">
        <h1 className="text-4xl font-bold text-white">Sudoku</h1>
        <SudokuGrid
          board={board}
          puzzle={puzzle}
          selected={selected}
          setSelected={(row, col) => setSelected([row, col])}
        />
      </section>
    </main>
  );
};

export default Page;
