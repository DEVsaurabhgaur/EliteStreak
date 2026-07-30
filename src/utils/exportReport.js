
export function generateCSVReport(dayLogs) { return 'Date,Habits,XP\n'; }

export function downloadFile(content, filename, type) { const b = new Blob([content], {type}); }
