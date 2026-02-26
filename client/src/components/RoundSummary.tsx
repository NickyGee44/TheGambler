import { useMemo } from "react";
import { useLocation } from "wouter";
import { getCourseForRound } from "@shared/courseData";
import { Button } from "@/components/ui/button";

interface RoundSummaryProps {
  round: number;
  holeScores: any[];
  isOpen: boolean;
  onClose: () => void;
  playerName?: string;
}

export default function RoundSummary({
  round,
  holeScores,
  isOpen,
  onClose,
  playerName,
}: RoundSummaryProps) {
  const [, navigate] = useLocation();

  const summary = useMemo(() => {
    const course = getCourseForRound(round);
    const holeParMap = new Map(course.holes.map((h) => [h.number, h.par]));
    const validScores = holeScores.filter((score) => score?.hole >= 1 && score?.hole <= 18 && score?.strokes > 0);

    const totalStrokes = validScores.reduce((sum, score) => sum + score.strokes, 0);
    const totalPar = course.totalPar;
    const toPar = totalStrokes - totalPar;

    let eagles = 0;
    let birdies = 0;
    let pars = 0;
    let bogeys = 0;
    let doublesPlus = 0;

    validScores.forEach((score) => {
      const par = holeParMap.get(score.hole) ?? 4;
      const diff = score.strokes - par;
      if (diff <= -2) eagles += 1;
      else if (diff === -1) birdies += 1;
      else if (diff === 0) pars += 1;
      else if (diff === 1) bogeys += 1;
      else doublesPlus += 1;
    });

    const fairwayScores = validScores.filter((score) => {
      const par = holeParMap.get(score.hole) ?? 4;
      return par === 4 || par === 5;
    });
    const fairwaysHit = fairwayScores.filter((score) => score.fairwayInRegulation === true).length;
    const girHit = validScores.filter((score) => score.greenInRegulation === true).length;
    const totalPutts = validScores.reduce((sum, score) => sum + (score.putts || 0), 0);
    const totalPenalties = validScores.reduce((sum, score) => sum + (score.penalties || 0), 0);

    return {
      totalStrokes,
      totalPar,
      toPar,
      eagles,
      birdies,
      pars,
      bogeys,
      doublesPlus,
      fairwaysHit,
      fairwaysTotal: 14,
      girHit,
      girTotal: 18,
      totalPutts,
      totalPenalties,
    };
  }, [holeScores, round]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-sm p-4">
      <div className="max-w-lg mx-auto mt-8 bg-gambler-black border border-gambler-border rounded-lg shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gambler-border text-center">
          <div className="text-gambler-gold text-sm tracking-[0.35em] font-black">ROUND {round} COMPLETE ✓</div>
          {playerName && <div className="text-gray-300 text-xs mt-2">{playerName}</div>}
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-gambler-slate border border-gambler-border rounded-md p-4 text-center">
            <div className="text-xs tracking-[0.2em] text-gray-400 mb-2">SCORE VS PAR</div>
            <div className="text-3xl font-black text-white">{summary.totalStrokes}</div>
            <div className="text-sm text-gray-400 mt-1">Par {summary.totalPar}</div>
            <div className={`text-lg font-bold mt-1 ${summary.toPar <= 0 ? "text-gambler-green" : "text-red-500"}`}>
              {summary.toPar > 0 ? `+${summary.toPar}` : summary.toPar}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="bg-gambler-slate border border-gambler-border rounded px-2 py-2 text-center text-white">🦅 {summary.eagles}</div>
            <div className="bg-gambler-slate border border-gambler-border rounded px-2 py-2 text-center text-white">🐦 {summary.birdies}</div>
            <div className="bg-gambler-slate border border-gambler-border rounded px-2 py-2 text-center text-white">Pars {summary.pars}</div>
            <div className="bg-gambler-slate border border-gambler-border rounded px-2 py-2 text-center text-white">Bogeys {summary.bogeys}</div>
            <div className="bg-gambler-slate border border-gambler-border rounded px-2 py-2 text-center text-white col-span-2 sm:col-span-1">Doubles+ {summary.doublesPlus}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-gambler-slate border border-gambler-border rounded px-3 py-2 text-gray-200">Fairways {summary.fairwaysHit}/{summary.fairwaysTotal}</div>
            <div className="bg-gambler-slate border border-gambler-border rounded px-3 py-2 text-gray-200">GIR {summary.girHit}/{summary.girTotal}</div>
            <div className="bg-gambler-slate border border-gambler-border rounded px-3 py-2 text-gray-200">Putts {summary.totalPutts}</div>
            <div className="bg-gambler-slate border border-gambler-border rounded px-3 py-2 text-gray-200">Penalties {summary.totalPenalties}</div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                onClose();
                navigate("/scores");
              }}
              className="flex-1 bg-gambler-green hover:bg-gambler-green/90 text-black font-bold"
            >
              VIEW LEADERBOARD
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1 border-gambler-border text-gray-200 hover:bg-gambler-slate">
              CLOSE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
