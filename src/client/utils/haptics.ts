/**
 * Triggers a device vibration if the Vibration API is supported.
 * @param pattern The vibration pattern (e.g., 50 for a short 50ms vibration, or [50, 50, 50] for a sequence).
 */
export const triggerHaptic = (pattern: number | number[] = 50) => {
  if (typeof window !== "undefined" && navigator && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignore vibration errors
    }
  }
};
