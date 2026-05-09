// ─── Haptic Feedback Utility ─────────────────────────────
// Uses the Vibration API — gracefully no-ops on desktop / unsupported browsers.

export const haptic = {
  /** Tiny 10ms tap — card taps, filter selection */
  light:   () => navigator.vibrate?.(10),

  /** Medium 25ms pulse — toggles, sort changes */
  medium:  () => navigator.vibrate?.(25),

  /** Double-pulse success pattern — favourites, saves, confirmations */
  success: () => navigator.vibrate?.([10, 50, 10]),
};
