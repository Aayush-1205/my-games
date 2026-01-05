"use client";

import GameCard from "./GameCard";

const games = [
  {
    id: 1,
    title: "Sudoku",
    description:
      "The classic number puzzle that tests your logic and reasoning. Fill the grid, master the patterns!",
    imageSrc: "/sudoku-banner.png",
    href: "/sudoku",
    status: "available" as const,
  },
  {
    id: 2,
    title: "Mystery Game",
    description:
      "A new adventure awaits. Something exciting is brewing in our game lab. Stay tuned!",
    imageSrc: "/sudoku-banner.png",
    href: "#",
    status: "coming-soon" as const,
  },
];

const GamesGrid = () => {
  return (
    <section className="relative py-16 px-4">
      {/* Section header */}
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-medium mb-4">
          🎯 Game Collection
        </span>
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Choose Your Challenge
        </h2>
      </div>

      {/* Games grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
        {games.map((game) => (
          <GameCard
            key={game.id}
            title={game.title}
            description={game.description}
            imageSrc={game.imageSrc}
            href={game.href}
            status={game.status}
          />
        ))}
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
    </section>
  );
};

export default GamesGrid;
