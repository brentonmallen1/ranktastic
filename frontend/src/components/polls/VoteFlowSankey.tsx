import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Info, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { PollResults } from '@/types';

// ── Palette ──────────────────────────────────────────────────────────────────
const PALETTE = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'var(--color-chart-6)',
  'var(--color-chart-7)',
  'var(--color-chart-8)',
];
const WINNER_COLOR = 'var(--color-chart-winner)';
const ELIM_COLOR = 'var(--color-chart-eliminated)';

// ── Layout constants ──────────────────────────────────────────────────────────
const NODE_W = 14;
const COL_GAP = 160;
const NODE_GAP = 10;
const DRAW_H = 340;
const MT = 24; // margin top
const MB = 28; // margin bottom (for round labels)
const MR = 60; // margin right (space for last-column option labels)
const ROUND_MS = 800; // delay between rounds

// ── Internal types ────────────────────────────────────────────────────────────
interface LNode {
  id: string;
  option: string;
  col: number;
  votes: number;
  color: string;
  isEliminated: boolean;
  isWinner: boolean;
  x: number;
  y: number;
  h: number;
}

interface LLink {
  id: string;
  fromOpt: string;
  toOpt: string;
  fromColor: string;
  toColor: string;
  isTransfer: boolean;
  col: number; // visible after col+1 appears
  sx: number;
  sy: number;
  sh: number;
  tx: number;
  ty: number;
  th: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Compute cumulative vote state per Sankey column */
function buildCols(results: PollResults): Map<string, number>[] {
  const cols: Map<string, number>[] = [];
  cols.push(new Map(Object.entries(results.first_choice_distribution)));
  for (const round of results.elimination_rounds) {
    const prev = cols[cols.length - 1];
    const next = new Map(prev);
    next.delete(round.eliminated);
    for (const t of round.transfers) {
      if (t.to_option !== 'exhausted') {
        next.set(t.to_option, (next.get(t.to_option) ?? 0) + t.count);
      }
    }
    cols.push(next);
  }
  return cols;
}

function buildLayout(
  cols: Map<string, number>[],
  results: PollResults,
  colorOf: (opt: string) => string,
  ml: number,
): { nodes: LNode[]; links: LLink[] } {
  const nodes: LNode[] = [];
  const links: LLink[] = [];

  const total = results.total_votes;

  // ── Nodes ──────────────────────────────────────────────────────────────────
  for (let ci = 0; ci < cols.length; ci++) {
    const col = cols[ci];
    const x = ml + ci * COL_GAP;
    const sorted = [...col.entries()].sort((a, b) => b[1] - a[1]);
    const usable = DRAW_H - Math.max(0, sorted.length - 1) * NODE_GAP;

    let y = MT;
    for (const [opt, votes] of sorted) {
      const h = Math.max(6, (votes / total) * usable);
      const isEliminated =
        ci < results.elimination_rounds.length &&
        results.elimination_rounds[ci].eliminated === opt;
      const isWinner = ci === cols.length - 1 && opt === results.winner;
      nodes.push({
        id: `${opt}__c${ci}`,
        option: opt,
        col: ci,
        votes,
        color: colorOf(opt),
        isEliminated,
        isWinner,
        x,
        y,
        h,
      });
      y += h + NODE_GAP;
    }
  }

  const nodeById = new Map(nodes.map(n => [n.id, n]));

  // ── Links ──────────────────────────────────────────────────────────────────
  const outY = new Map<string, number>();
  const inY = new Map<string, number>();

  for (let ci = 0; ci < cols.length - 1; ci++) {
    const round = results.elimination_rounds[ci];
    const nextCol = cols[ci + 1];

    const raw: { fromOpt: string; toOpt: string; value: number; isTransfer: boolean }[] = [];

    // Retained: each surviving option carries its votes forward
    for (const [opt] of nextCol) {
      const fn = nodeById.get(`${opt}__c${ci}`);
      if (fn) raw.push({ fromOpt: opt, toOpt: opt, value: fn.votes, isTransfer: false });
    }

    // Transferred: eliminated option's votes redistribute
    for (const t of round.transfers) {
      if (t.to_option !== 'exhausted' && t.count > 0) {
        raw.push({ fromOpt: round.eliminated, toOpt: t.to_option, value: t.count, isTransfer: true });
      }
    }

    // Sort by target node Y to minimise visual crossings
    raw.sort((a, b) => {
      const ay = nodeById.get(`${a.toOpt}__c${ci + 1}`)?.y ?? 0;
      const by = nodeById.get(`${b.toOpt}__c${ci + 1}`)?.y ?? 0;
      return ay - by;
    });

    for (const lk of raw) {
      const fn = nodeById.get(`${lk.fromOpt}__c${ci}`);
      const tn = nodeById.get(`${lk.toOpt}__c${ci + 1}`);
      if (!fn || !tn) continue;

      const sh = Math.max(1, (lk.value / fn.votes) * fn.h);
      const th = Math.max(1, (lk.value / tn.votes) * tn.h);
      const sy = fn.y + (outY.get(fn.id) ?? 0);
      const ty = tn.y + (inY.get(tn.id) ?? 0);

      outY.set(fn.id, (outY.get(fn.id) ?? 0) + sh);
      inY.set(tn.id, (inY.get(tn.id) ?? 0) + th);

      links.push({
        id: `${lk.fromOpt}__${lk.toOpt}__c${ci}`,
        fromOpt: lk.fromOpt,
        toOpt: lk.toOpt,
        fromColor: lk.isTransfer ? ELIM_COLOR : colorOf(lk.fromOpt),
        toColor: colorOf(lk.toOpt),
        isTransfer: lk.isTransfer,
        col: ci,
        sx: fn.x + NODE_W,
        sy,
        sh,
        tx: tn.x,
        ty,
        th,
      });
    }
  }

  return { nodes, links };
}

/** Closed filled bezier path for a Sankey ribbon */
function ribbon(
  sx: number, sy: number, sh: number,
  tx: number, ty: number, th: number,
): string {
  const mx = (sx + tx) / 2;
  return [
    `M ${sx} ${sy}`,
    `C ${mx} ${sy}, ${mx} ${ty}, ${tx} ${ty}`,
    `L ${tx} ${ty + th}`,
    `C ${mx} ${ty + th}, ${mx} ${sy + sh}, ${sx} ${sy + sh}`,
    'Z',
  ].join(' ');
}

/** Safe SVG id fragment — strips non-alphanumeric chars */
function sid(s: string) {
  return s.replace(/\W/g, '_');
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function VoteFlowSankey({ results }: { results: PollResults }) {
  const [visCol, setVisCol] = useState(-1);
  const [animKey, setAnimKey] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const options = useMemo(() => results.rankings.map(r => r.option), [results]);
  const colorOf = useCallback(
    (opt: string) => PALETTE[options.indexOf(opt) % PALETTE.length],
    [options],
  );

  const cols = useMemo(() => buildCols(results), [results]);

  // Dynamic left margin based on longest option name (approx 6.5px per char)
  const ml = useMemo(
    () => Math.min(180, Math.max(60, Math.max(...options.map(o => o.length)) * 6.5 + 12)),
    [options],
  );

  const { nodes, links } = useMemo(
    () => buildLayout(cols, results, colorOf, ml),
    [cols, results, colorOf, ml],
  );

// Animate: reveal one column at a time, auto-scroll to keep it visible
  useEffect(() => {
    setVisCol(-1);
    const timers = cols.map((_, i) =>
      setTimeout(() => {
        setVisCol(i);
        if (scrollRef.current) {
          const colX = ml + i * COL_GAP;
          const el = scrollRef.current;
          const targetScroll = colX - el.clientWidth * 0.6;
          el.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
        }
      }, 400 + i * ROUND_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [cols.length, animKey, ml]);

  const replay = useCallback(() => {
    setVisCol(-1);
    setAnimKey(k => k + 1);
  }, []);

  const svgW = ml + (cols.length - 1) * COL_GAP + NODE_W + MR;
  const svgH = DRAW_H + MT + MB;

  // Which column is "active" (just appeared) for highlight effects
  const activeCol = visCol;

  return (
    <div className="space-y-2">
      <div className="relative">
        <div
          ref={scrollRef}
          className="overflow-x-scroll rounded-lg [scrollbar-width:thin] [scrollbar-color:hsl(var(--border))_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
        >
        <svg
          width={svgW}
          height={svgH}
          style={{ display: 'block', margin: '0 auto', minWidth: svgW }}
        >
          <defs>
            {/* Per-link gradient: source colour → destination colour */}
            {links.map(l => (
              <linearGradient key={l.id} id={`g_${sid(l.id)}`} x1="0" y1="0" x2="1" y2="0">
                <stop
                  offset="0%"
                  stopColor={l.fromColor}
                  stopOpacity={l.isTransfer ? 0.75 : 0.5}
                />
                <stop
                  offset="100%"
                  stopColor={l.toColor}
                  stopOpacity={l.isTransfer ? 0.35 : 0.15}
                />
              </linearGradient>
            ))}

            {/* Winner drop shadow */}
            <filter id="wglow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="currentColor" floodOpacity="0.18" />
            </filter>

            {/* Subtle node shadow for the active column */}
            <filter id="nglow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="currentColor" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* ── Sankey ribbons (behind nodes) ─────────────────────────── */}
          {links.map(l => {
            const show = visCol > l.col;
            return (
              <path
                key={l.id}
                d={ribbon(l.sx, l.sy, l.sh, l.tx, l.ty, l.th)}
                fill={`url(#g_${sid(l.id)})`}
                style={{
                  opacity: show ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                }}
              />
            );
          })}

          {/* ── Nodes ─────────────────────────────────────────────────── */}
          {nodes.map(n => {
            const show = visCol >= n.col;
            const isActive = activeCol === n.col;
            const w = NODE_W;
            const fill = n.isEliminated ? ELIM_COLOR : n.color;

            return (
              <g
                key={n.id}
                style={{
                  opacity: show ? 1 : 0,
                  transition: 'opacity 0.35s ease',
                }}
              >
                {/* Node bar */}
                <rect
                  x={n.x}
                  y={n.y}
                  width={w}
                  height={n.h}
                  rx={3}
                  fill={fill}
                  fillOpacity={n.isEliminated ? 0.45 : 1}
                  filter={n.isWinner ? 'url(#wglow)' : isActive && !n.isEliminated ? 'url(#nglow)' : undefined}
                />

                {/* Vote count inside bar (if tall enough) */}
                {n.h >= 22 && (
                  <text
                    x={n.x + NODE_W / 2}
                    y={n.y + n.h / 2 + 0.5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={9}
                    fontWeight="600"
                    fill="white"
                    fillOpacity={0.9}
                    style={{ pointerEvents: 'none' }}
                  >
                    {n.votes}
                  </text>
                )}

                {/* Labels: first column on LEFT */}
                {n.col === 0 && (
                  <text
                    x={n.x - 7}
                    y={n.y + n.h / 2 + 0.5}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize={11}
                    fill={n.color}
                    fontWeight="500"
                    style={{ pointerEvents: 'none' }}
                  >
                    {truncate(n.option, 20)}
                  </text>
                )}

                {/* Last column non-winner: small label to the right */}
                {n.col === cols.length - 1 && !n.isWinner && (
                  <text
                    x={n.x + NODE_W + 7}
                    y={n.y + n.h / 2 + 0.5}
                    dominantBaseline="middle"
                    fontSize={10}
                    fill="currentColor"
                    fillOpacity={0.45}
                    style={{ pointerEvents: 'none' }}
                  >
                    {truncate(n.option, 16)}
                  </text>
                )}

                {/* Middle-column: small label if bar is tall enough */}
                {n.col > 0 && n.col < cols.length - 1 && n.h >= 32 && (
                  <text
                    x={n.x + NODE_W + 5}
                    y={n.y + n.h / 2 + 0.5}
                    dominantBaseline="middle"
                    fontSize={9}
                    fill="currentColor"
                    fillOpacity={0.45}
                    style={{ pointerEvents: 'none' }}
                  >
                    {truncate(n.option, 14)}
                  </text>
                )}
              </g>
            );
          })}


          {/* ── Round labels at the bottom ────────────────────────────── */}
          {cols.map((_, i) => (
            <text
              key={i}
              x={ml + i * COL_GAP + NODE_W / 2}
              y={svgH - 6}
              textAnchor="middle"
              fontSize={10}
              fill="currentColor"
              style={{
                opacity: visCol >= i ? 0.4 : 0,
                transition: 'opacity 0.3s ease',
              }}
            >
              {i === 0 ? 'Start' : i === cols.length - 1 ? 'Final' : `Round ${i}`}
            </text>
          ))}
        </svg>
        </div>
      </div>

      <div className="space-y-3 border-t pt-3 mt-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground h-7 text-xs">
                  <Info className="h-3 w-3" />
                  How to read this
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-xs text-muted-foreground leading-relaxed">
                <p className="font-semibold text-foreground mb-1.5">How instant-runoff voting works</p>
                <p>
                  Each column is a round. Bars show how many votes each option holds — taller means more support.
                  The option with the fewest votes is eliminated each round, and those voters'{' '}
                  <strong>next-ranked choice</strong> absorbs their votes.
                  Brighter flows are transferred votes; faint flows stay put.
                  This repeats until one option remains.
                </p>
              </PopoverContent>
            </Popover>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={replay}
            className="gap-1.5 text-muted-foreground h-7 text-xs shrink-0"
          >
            <RotateCcw className="h-3 w-3" />
            Replay
          </Button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-8 h-2.5 rounded-sm bg-gradient-to-r from-indigo-400/50 to-indigo-400/15" />
            <span>Retained votes</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-8 h-2.5 rounded-sm bg-gradient-to-r from-zinc-400/60 to-fuchsia-500/70" />
            <span>Transferred votes</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: ELIM_COLOR }} />
            <span>Eliminated</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: WINNER_COLOR, boxShadow: `0 0 5px ${WINNER_COLOR}` }} />
            <span>Winner</span>
          </div>
        </div>

        {/* Round-by-round table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="text-left py-1.5 pr-6 font-medium text-muted-foreground">Option</th>
                {cols.map((_, i) => (
                  <th key={i} className="text-right py-1.5 px-3 font-medium text-muted-foreground whitespace-nowrap min-w-[56px]">
                    {i === 0 ? 'Start' : i === cols.length - 1 ? 'Final' : `Round ${i}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {options.map((opt) => {
                const isWinner = opt === results.winner;
                const elimAtCol = results.elimination_rounds.findIndex(r => r.eliminated === opt);

                return (
                  <tr key={opt} className="border-t border-border/40">
                    <td className="py-1.5 pr-6">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-sm shrink-0"
                          style={{ backgroundColor: isWinner ? WINNER_COLOR : colorOf(opt) }}
                        />
                        <span className={isWinner ? 'font-medium' : ''}
                          style={{ color: isWinner ? WINNER_COLOR : undefined }}>
                          {opt}
                        </span>
                      </span>
                    </td>
                    {cols.map((col, ci) => {
                      const votes = col.get(opt);
                      const prevVotes = ci > 0 ? cols[ci - 1].get(opt) : undefined;
                      const gained = votes !== undefined && prevVotes !== undefined ? votes - prevVotes : 0;
                      const isElimHere = elimAtCol === ci;
                      const isGone = votes === undefined;

                      if (isGone) {
                        return (
                          <td key={ci} className="text-right py-1.5 px-3 text-muted-foreground/25">—</td>
                        );
                      }

                      return (
                        <td
                          key={ci}
                          className={[
                            'text-right py-1.5 px-3 tabular-nums',
                            isElimHere ? 'line-through text-muted-foreground/40' : '',
                            isWinner && ci === cols.length - 1 ? 'font-semibold' : '',
                          ].join(' ')}
                          style={{ color: isWinner && ci === cols.length - 1 ? WINNER_COLOR : undefined }}
                        >
                          {votes}
                          {gained > 0 && !isElimHere && (
                            <span className="text-emerald-500 ml-0.5">+{gained}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
