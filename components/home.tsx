"use client";

import HeroSection from "./Home/HeroSection";
import GamesGrid from "./Home/GamesGrid";

const Home = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Animated background pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.1),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.08),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <HeroSection />
        <GamesGrid />
      </div>

      {/* Footer decoration */}
      <div className="relative z-10 py-8 text-center">
        <p className="text-slate-600 text-sm">
          Built with 💜 for puzzle enthusiasts
        </p>
      </div>
    </main>
  );
};

export default Home;
