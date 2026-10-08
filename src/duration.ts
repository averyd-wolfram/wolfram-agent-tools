/**
 * A duration as a person reads it: the one way this server says one (#38).
 *
 * Each path wrote its own. The private path said "within 2.4s", the broker
 * client "did not answer callTool within 302000ms", `wolfram_status` and
 * `doctor` divided a setting by a thousand, a back-off said "4m 05s", and a
 * setting held to 24 days (#28) read "within 2073600s". Now the unit fits the
 * size — milliseconds below a second, tenths of one below ten, then seconds,
 * minutes, hours and days — with at most two units, the second left out when
 * it is zero: "400ms", "2.4s", "45s", "4m 05s", "2m", "1h 30m", "24d".
 *
 * Only the rounding differs, by purpose, and only in the last unit shown.
 */

const UNITS = [
  { ms: 86_400_000, name: "d" },
  { ms: 3_600_000, name: "h" },
  { ms: 60_000, name: "m" },
  { ms: 1_000, name: "s" },
] as const;

function durationText(ms: number, round: (x: number) => number): string {
  // Said as it is rather than as a plausible time: nothing should hand one
  // over, and a guess would hide that something did.
  if (!Number.isFinite(ms)) return String(ms);
  if (ms <= 0) return "0ms";
  // Each scale is rounded at its own resolution, and a value that rounds up to
  // the next scale's start is said in that scale: 999.5ms waited is "1s".
  if (ms < 1_000 && round(ms) < 1_000) return `${round(ms)}ms`;
  if (ms < 10_000 && round(ms / 100) < 100) return `${round(ms / 100) / 10}s`;
  // From ten seconds up, the largest unit that fits and the one below it. The
  // total is rounded at the smaller one's resolution, so a carry lands on a
  // whole larger unit and leaves nothing below it.
  const at = UNITS.findIndex((unit) => ms >= unit.ms);
  const step = UNITS[at + 1]?.ms ?? 1_000;
  const total = round(ms / step) * step;
  const first = UNITS.find((unit) => total >= unit.ms) ?? UNITS[3];
  const count = Math.floor(total / first.ms);
  const rest = total - count * first.ms;
  const second = UNITS[UNITS.indexOf(first) + 1];
  if (!second || rest === 0) return `${count}${first.name}`;
  return `${count}${first.name} ${String(rest / second.ms).padStart(2, "0")}${second.name}`;
}

/**
 * A time given: a limit, a setting, what a stage had. Rounded down, so it never
 * claims time that was not given — rounded to whole seconds, a budget of 400ms
 * read "within 0s" (#10), and rounded up, 2.49s would have read 2.5s.
 */
export function budgetText(ms: number): string {
  return durationText(ms, Math.floor);
}

/**
 * A time still to wait, as before a back-off lets a start be tried again.
 * Rounded up, so it never says sooner than it will be: "retried in 0s" of a
 * wait with half a second left would send someone back to fail again.
 */
export function waitText(ms: number): string {
  return durationText(ms, Math.ceil);
}
