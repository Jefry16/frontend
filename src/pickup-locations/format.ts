/** "09:30:00" (ISO local time) → "09:30" for display. */
export const formatTime = (time: string): string => time.slice(0, 5);
