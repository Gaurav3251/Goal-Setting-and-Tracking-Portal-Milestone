import { exportAchievementReport } from '../utils/exportHelper';

export default function ExportButton({ data }) {
  return (
    <div className="flex gap-2">
      <button onClick={() => exportAchievementReport(data, 'xlsx')} className="rounded bg-brand-600 px-3 py-2 text-white">Export XLSX</button>
      <button onClick={() => exportAchievementReport(data, 'csv')} className="rounded border px-3 py-2">Export CSV</button>
    </div>
  );
}
