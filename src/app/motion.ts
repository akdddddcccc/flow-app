/**
 * Flow motion language, grounded in the Apple Design skill:
 * immediate feedback, critically damped transitions, and bounce only after momentum.
 */
export const flowMotion = {
  screen: { type: "spring" as const, duration: 0.38, bounce: 0 },
  local: { type: "spring" as const, duration: 0.32, bounce: 0 },
  sheet: { type: "spring" as const, duration: 0.36, bounce: 0 },
  press: { type: "spring" as const, duration: 0.18, bounce: 0 },
  settle: { type: "spring" as const, duration: 0.28, bounce: 0 },
  fade: { duration: 0.18, ease: [0.23, 1, 0.32, 1] as const },
};

export const staggerDelay = (index: number) => Math.min(index * 0.035, 0.18);
