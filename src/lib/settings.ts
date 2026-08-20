// Local-only preferences — no server sync needed for a single-user app.
const LOG_REMINDER_KEY = 'closet:log-reminder-enabled'

export function getLogReminderEnabled(): boolean {
  return localStorage.getItem(LOG_REMINDER_KEY) !== 'false'
}
export function setLogReminderEnabled(enabled: boolean): void {
  localStorage.setItem(LOG_REMINDER_KEY, String(enabled))
}
