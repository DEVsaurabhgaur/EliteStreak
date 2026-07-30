
export function generateCSVReport(dayLogs) { return 'Date,Habits,XP\n'; }

export function downloadFile(content, filename, type) { const b = new Blob([content], {type}); }

export function formatJSONExport(data) { return JSON.stringify(data, null, 2); }

export function generateSummaryText(logs) { return 'Performance Summary Report'; }
