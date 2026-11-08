import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

type CalendarTask = {
    id: number;
    title: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in_progress' | 'completed';
    due_date: string | null;
};

const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const dotColors = {
    high: 'bg-rose-400',
    medium: 'bg-amber-400',
    low: 'bg-emerald-400',
};
const statusLabels = {
    pending: 'Belum Dikerjakan',
    in_progress: 'Sedang Dikerjakan',
    completed: 'Selesai',
};

function toKey(year: number, month: number, day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function WorkspaceCalendar({ tasks }: { tasks: CalendarTask[] }) {
    const now = new Date();
    const todayKey = toKey(now.getFullYear(), now.getMonth(), now.getDate());

    const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });
    const [selectedKey, setSelectedKey] = useState(todayKey);

    // Kelompokkan tugas berdasarkan tanggal deadline (YYYY-MM-DD).
    const tasksByDate = useMemo(() => {
        const map: Record<string, CalendarTask[]> = {};
        tasks.forEach((task) => {
            if (!task.due_date) return;
            const key = task.due_date.substring(0, 10);
            if (!map[key]) map[key] = [];
            map[key].push(task);
        });
        return map;
    }, [tasks]);

    // Minggu dimulai hari Senin.
    const cells = useMemo(() => {
        const offset = (new Date(view.year, view.month, 1).getDay() + 6) % 7;
        const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
        const result: (number | null)[] = Array(offset).fill(null);
        for (let day = 1; day <= daysInMonth; day++) result.push(day);
        return result;
    }, [view]);

    const goPrev = () =>
        setView((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 }));
    const goNext = () =>
        setView((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 }));
    const goToday = () => {
        setView({ year: now.getFullYear(), month: now.getMonth() });
        setSelectedKey(todayKey);
    };

    const selectedTasks = tasksByDate[selectedKey] ?? [];
    const [selYear, selMonth, selDay] = selectedKey.split('-').map(Number);
    const selectedLabel = `${selDay} ${monthNames[selMonth - 1]} ${selYear}`;

    return (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-xl sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <CalendarDays size={18} className="text-cyan-300" />
                    <h2 className="text-lg font-semibold">Kalender Ruang Kerja</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={goToday} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 transition hover:border-violet-400/30 hover:text-violet-300">
                        Hari ini
                    </button>
                    <button type="button" onClick={goPrev} aria-label="Bulan sebelumnya" className="rounded-lg border border-white/10 p-1.5 text-gray-400 transition hover:border-violet-400/30 hover:text-violet-300">
                        <ChevronLeft size={16} />
                    </button>
                    <button type="button" onClick={goNext} aria-label="Bulan berikutnya" className="rounded-lg border border-white/10 p-1.5 text-gray-400 transition hover:border-violet-400/30 hover:text-violet-300">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <p className="mb-3 text-sm font-medium text-gray-300">
                {monthNames[view.month]} {view.year}
            </p>

            <div className="grid grid-cols-7 gap-1 text-center">
                {dayNames.map((name) => (
                    <div key={name} className="pb-1 text-[11px] text-gray-500">{name}</div>
                ))}

                {cells.map((day, index) => {
                    if (day === null) return <div key={`empty-${index}`} />;

                    const key = toKey(view.year, view.month, day);
                    const dayTasks = tasksByDate[key] ?? [];
                    const isToday = key === todayKey;
                    const isSelected = key === selectedKey;

                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setSelectedKey(key)}
                            className={`flex h-11 flex-col items-center justify-center gap-1 rounded-lg border text-xs transition sm:h-12 ${
                                isSelected
                                    ? 'border-violet-400/50 bg-violet-500/20 text-white'
                                    : isToday
                                        ? 'border-cyan-400/30 bg-cyan-500/[0.06] text-cyan-200'
                                        : 'border-transparent text-gray-400 hover:border-white/10 hover:bg-white/[0.04]'
                            }`}
                        >
                            <span>{day}</span>
                            <span className="flex h-1.5 items-center gap-0.5">
                                {dayTasks.slice(0, 3).map((task) => (
                                    <span
                                        key={task.id}
                                        className={`size-1.5 rounded-full ${dotColors[task.priority]} ${task.status === 'completed' ? 'opacity-30' : ''}`}
                                    />
                                ))}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="mt-5 rounded-xl border border-white/[0.06] bg-black/20 p-4">
                <p className="mb-3 text-xs font-medium text-violet-300">Tugas pada {selectedLabel}</p>
                {selectedTasks.length === 0 ? (
                    <p className="text-xs text-gray-500">Tidak ada tugas dengan deadline di tanggal ini.</p>
                ) : (
                    <div className="space-y-2">
                        {selectedTasks.map((task) => (
                            <div key={task.id} className="flex items-center gap-3">
                                <span className={`size-2 shrink-0 rounded-full ${dotColors[task.priority]}`} />
                                <div className="min-w-0 flex-1">
                                    <p className={`truncate text-sm ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                                        {task.title}
                                    </p>
                                    <p className="text-[11px] text-gray-500">{statusLabels[task.status]}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}