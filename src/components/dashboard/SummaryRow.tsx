import type { Staff, LogEntry } from "@/lib/types";
import { summaryData } from "@/lib/calculations";

export default function SummaryRow({
  label, staff, logs, viewStart, viewEnd,
}: { label: string; staff: Staff[]; logs: LogEntry[]; viewStart: string; viewEnd: string }) {
  const { grand, byStaff } = summaryData(logs, staff.map(s => s.name), viewStart, viewEnd);

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      <span className="text-[10px] font-bold tracking-wider uppercase text-[var(--accent-green)]">{label}</span>
      {staff.map(s => (
        <span key={s.id} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
          {s.name.split(" ").pop()}: <b className="text-[var(--text-primary)]">{byStaff[s.name] || 0}m</b>
        </span>
      ))}
      <span className="ml-auto text-sm font-bold text-[var(--text-primary)]">{grand}m</span>
    </div>
  );
}
