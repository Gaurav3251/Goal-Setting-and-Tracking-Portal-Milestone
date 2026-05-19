import * as XLSX from 'xlsx';

export function exportAchievementReport(data, format = 'xlsx') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Achievement Report');
  if (format === 'csv') {
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `achievement_report_${Date.now()}.csv`;
    link.click();
    return;
  }
  XLSX.writeFile(wb, `achievement_report_${Date.now()}.xlsx`);
}
