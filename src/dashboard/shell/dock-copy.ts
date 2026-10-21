export const STATUS_FA = {
  idle: 'آماده برای اجرا',
  paused: 'متوقف — رویداد در انتظار',
  playing: 'در حال اجرا',
} as const;

export function formatSpeed(value: number): string {
  return `${value}×`;
}
