"use client";

import Image from "next/image";
import Link from "next/link";

interface GameCardProps {
  title: string;
  description: string;
  imageSrc: string;
  href: string;
  status: "available" | "coming-soon";
}

const GameCard = ({
  title,
  description,
  imageSrc,
  href,
  status,
}: GameCardProps) => {
  const isComingSoon = status === "coming-soon";

  return (
    <div className="group relative w-full max-w-sm">
      {/* Glow effect behind card */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition-all duration-500 animate-pulse" />

      {/* Card container */}
      <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-purple-500/20">
        {/* Image container */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />

          {/* Status badge */}
          <div className="absolute bottom-3 left-3 right-3">
            {isComingSoon ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-sm font-semibold text-amber-300 tracking-wide">
                  COMING SOON
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-semibold text-emerald-300 tracking-wide">
                  PLAY NOW
                </span>
              </span>
            )}
          </div>

          {/* Shine effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute -inset-full top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:animate-shine" />
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-2">
            {title}
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            {description}
          </p>

          {/* Action button */}
          {isComingSoon ? (
            <button
              disabled
              className="w-full py-3 px-6 rounded-xl bg-slate-700/50 text-slate-500 font-semibold cursor-not-allowed border border-slate-600/30"
            >
              Notify Me
            </button>
          ) : (
            <Link
              href={href}
              className="block w-full py-3 px-6 rounded-xl text-center bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5"
            >
              Play Now
            </Link>
          )}
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 right-0 w-20 h-20 opacity-20">
          <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-cyan-400" />
          <div className="absolute top-4 right-8 w-1 h-1 rounded-full bg-purple-400" />
          <div className="absolute top-8 right-4 w-1 h-1 rounded-full bg-purple-400" />
        </div>
      </div>
    </div>
  );
};

export default GameCard;
