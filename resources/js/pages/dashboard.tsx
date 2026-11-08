import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    BrainCircuit, Check, CheckCircle2, Clock3, Flame,
    LayoutDashboard, ListTodo, Plus, Search, Settings, Sparkles, Target,
    TrendingUp, Trash2, Zap, Pencil, X, RotateCcw, Bell, AlertTriangle,
    CalendarClock,
} from 'lucide-react';
import { dashboard } from '@/routes';
import WorkspaceCalendar from '@/components/workspace-calendar';

type Task = {
    id: number;
    title: string;
    description: string | null;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in_progress' | 'completed';
    due_date: string | null;
};

type ReminderTask = Task & { daysLeft: number };

type DashboardProps = {
    tasks: Task[];
    taskStats: { total: number; completed: number; pending: number; in_progress: number };
    settings: { display_name: string | null; reminder_days: number };
};

const priorityStyles = {
    high: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};
const priorityLabels = { high: 'Tinggi', medium: 'Sedang', low: 'Rendah' };
const statusStyles = {
    pending: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
    in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};
const statusLabels = {
    pending: 'Belum Dikerjakan',
    in_progress: 'Sedang Dikerjakan',
    completed: 'Selesai',
};

// Ubah tanggal dari YYYY-MM-DD menjadi DD/MM/YYYY hanya untuk tampilan.
function formatTanggal(value: string | null): string {
    if (!value) return '';
    const [year, month, day] = value.substring(0, 10).split('-');
    return `${day}/${month}/${year}`;
}

// Label dan warna reminder dipakai bersama oleh panel reminder dan Notification Bell.
function getReminderMeta(daysLeft: number) {
    if (daysLeft < 0) {
        return {
            label: `Terlambat ${Math.abs(daysLeft)} hari`,
            tone: 'border-rose-400/20 bg-rose-500/[0.06] text-rose-300',
            dot: 'bg-rose-400',
        };
    }
    if (daysLeft === 0) {
        return {
            label: 'Deadline hari ini',
            tone: 'border-amber-400/20 bg-amber-500/[0.06] text-amber-300',
            dot: 'bg-amber-400',
        };
    }
    return {
        label: `${daysLeft} hari lagi`,
        tone: 'border-cyan-400/20 bg-cyan-500/[0.06] text-cyan-300',
        dot: 'bg-cyan-400',
    };
}

function MetricCard({
    title, value, subtitle, icon: Icon, accent,
}: {
    title: string; value: string | number; subtitle: string;
    icon: typeof CheckCircle2; accent: string;
}) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-xl transition duration-300 hover:border-violet-400/30 hover:bg-white/[0.05]">
            <div className="absolute -right-8 -top-8 size-24 rounded-full bg-violet-500/10 blur-3xl transition group-hover:bg-violet-500/20" />
            <div className="relative flex items-start justify-between">
                <p className="text-sm text-gray-400">{title}</p>
                <div className={`rounded-xl p-2.5 ${accent}`}><Icon size={18} /></div>
            </div>
            <div className="relative mt-5 flex items-end justify-between">
                <h3 className="text-3xl font-semibold tracking-tight text-white">{value}</h3>
                <p className="mb-1 flex items-center gap-1 text-xs text-emerald-400"><TrendingUp size={13} />{subtitle}</p>
            </div>
        </div>
    );
}

export default function Dashboard({ tasks, taskStats, settings }: DashboardProps) {
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [bellOpen, setBellOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const bellRef = useRef<HTMLDivElement>(null);

    // Pengaturan ruang kerja dari database (dengan nilai bawaan).
    const reminderDays = settings.reminder_days;
    const displayName = settings.display_name || 'Althaf';
    const upcomingLabel = reminderDays > 1 ? `1–${reminderDays} hari lagi` : '1 hari lagi';

    const form = useForm({
        title: '', description: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        status: 'pending' as 'pending' | 'in_progress' | 'completed',
        due_date: '',
    });
    const editForm = useForm({
        title: '', description: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        status: 'pending' as 'pending' | 'in_progress' | 'completed',
        due_date: '',
    });
    const settingsForm = useForm({
        display_name: settings.display_name ?? '',
        reminder_days: settings.reminder_days,
    });

    const filteredTasks = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        return tasks.filter((task) => {
            const matchesSearch =
                !keyword ||
                task.title.toLowerCase().includes(keyword) ||
                (task.description ?? '').toLowerCase().includes(keyword);
            const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
            const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [tasks, searchTerm, filterStatus, filterPriority]);

    const resetFilters = () => {
        setSearchTerm('');
        setFilterStatus('all');
        setFilterPriority('all');
    };

    // Reminder dihitung dari deadline lokal perangkat. Tugas selesai tidak ditampilkan.
    const reminderTasks = useMemo<ReminderTask[]>(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return tasks
            .filter((task) => task.status !== 'completed' && task.due_date)
            .map((task) => {
                const dueDate = new Date(`${task.due_date!.substring(0, 10)}T00:00:00`);
                const daysLeft = Math.round((dueDate.getTime() - today.getTime()) / 86400000);
                return { ...task, daysLeft };
            })
            .filter((task) => task.daysLeft <= reminderDays)
            .sort((a, b) => a.daysLeft - b.daysLeft);
    }, [tasks, reminderDays]);

    const overdueTasks = reminderTasks.filter((task) => task.daysLeft < 0);
    const dueTodayTasks = reminderTasks.filter((task) => task.daysLeft === 0);
    const upcomingTasks = reminderTasks.filter((task) => task.daysLeft > 0);

    // Ringkasan Asisten Produktivitas: dihitung dari data tugas (berbasis aturan, tanpa API).
    const insight = (() => {
        const activeTasks = tasks.filter((task) => task.status !== 'completed');
        const highActive = activeTasks.filter((task) => task.priority === 'high').length;

        let headline: string;
        let advice: string;

        if (tasks.length === 0) {
            headline = 'Belum ada tugas di ruang kerjamu.';
            advice = 'Mulai dengan menambahkan tugas pertamamu, lalu atur prioritas dan deadline-nya.';
        } else if (activeTasks.length === 0) {
            headline = 'Semua tugasmu sudah selesai.';
            advice = 'Kerja bagus. Tambahkan tugas baru atau manfaatkan waktu untuk beristirahat.';
        } else if (overdueTasks.length > 0) {
            headline = `${overdueTasks.length} tugas sudah melewati deadline.`;
            advice = 'Selesaikan atau jadwalkan ulang tugas yang terlambat sebelum mengambil pekerjaan baru.';
        } else if (dueTodayTasks.length > 0) {
            headline = `${dueTodayTasks.length} tugas berdeadline hari ini.`;
            advice = 'Prioritaskan tugas yang jatuh tempo hari ini, lalu lanjutkan ke tugas berikutnya.';
        } else {
            headline = `Kamu memiliki ${activeTasks.length} tugas aktif.`;
            advice = highActive > 0
                ? `${highActive} di antaranya berprioritas tinggi. Kerjakan yang paling penting lebih dulu.`
                : 'Tidak ada deadline mendesak. Selesaikan tugas satu per satu dengan tenang.';
        }

        // Tugas yang disarankan untuk difokuskan berikutnya.
        let focusTask: { title: string; note: string } | null = null;
        if (reminderTasks.length > 0) {
            const urgent = reminderTasks[0];
            focusTask = { title: urgent.title, note: getReminderMeta(urgent.daysLeft).label };
        } else {
            const next =
                activeTasks.find((task) => task.priority === 'high') ??
                activeTasks.find((task) => task.status === 'in_progress') ??
                activeTasks[0];
            if (next) {
                focusTask = {
                    title: next.title,
                    note: `Prioritas ${priorityLabels[next.priority].toLowerCase()} · ${statusLabels[next.status]}`,
                };
            }
        }

        return { headline, advice, focusTask };
    })();

    // Tutup dropdown bell saat klik di luar area atau menekan Escape.
    useEffect(() => {
        if (!bellOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
                setBellOpen(false);
            }
        };
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setBellOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [bellOpen]);

    const tambahTugas = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/tasks', { preserveScroll: true, onSuccess: () => form.reset() });
    };

    const mulaiEditTugas = (task: Task) => {
        setEditingTask(task);
        editForm.clearErrors();
        editForm.setData({
            title: task.title,
            description: task.description ?? '',
            priority: task.priority,
            status: task.status,
            due_date: task.due_date ? task.due_date.substring(0, 10) : '',
        });
    };

    const simpanEditTugas = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTask) return;
        editForm.put(`/tasks/${editingTask.id}`, {
            preserveScroll: true,
            onSuccess: () => { setEditingTask(null); editForm.reset(); },
        });
    };

    const tutupModalEdit = () => {
        setEditingTask(null);
        editForm.reset();
        editForm.clearErrors();
    };

    const bukaPengaturan = () => {
        settingsForm.clearErrors();
        settingsForm.setData({
            display_name: settings.display_name ?? '',
            reminder_days: settings.reminder_days,
        });
        setSettingsOpen(true);
    };

    const tutupPengaturan = () => {
        setSettingsOpen(false);
        settingsForm.clearErrors();
    };

    const simpanPengaturan = (e: React.FormEvent) => {
        e.preventDefault();
        settingsForm.put('/workspace-settings', {
            preserveScroll: true,
            onSuccess: () => setSettingsOpen(false),
        });
    };

    const ubahStatusTugas = (task: Task) => {
        router.patch(`/tasks/${task.id}/toggle-complete`, {}, { preserveScroll: true });
    };

    const hapusTugas = (task: Task) => {
        if (confirm(`Yakin ingin menghapus tugas "${task.title}"?`)) {
            router.delete(`/tasks/${task.id}`, { preserveScroll: true });
        }
    };

    const persentaseSelesai = taskStats.total > 0
        ? Math.round((taskStats.completed / taskStats.total) * 100)
        : 0;

    const inputClass = 'w-full rounded-xl border border-white/10 bg-[#11111b] px-3 py-3 text-sm text-gray-300 outline-none focus:border-violet-400/40';
    const textInputClass = 'w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-violet-400/40';

    return (
        <>
            <Head title="NeuroDesk — Dasbor" />
            <div className="min-h-screen bg-[#07070b] px-4 py-6 text-white sm:px-6 lg:px-8">
                <div className="mx-auto max-w-[1500px] space-y-7">
                    {/* HEADER */}
                    <header className="relative z-30 rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[#171323] via-[#0c0c13] to-[#07070b] p-6 sm:p-8">
                        {/* Glow dekoratif dipisah agar dropdown tidak terpotong overflow-hidden */}
                        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                            <div className="absolute -right-20 -top-20 size-72 rounded-full bg-violet-600/15 blur-[100px]" />
                            <div className="absolute bottom-0 right-1/4 h-32 w-72 rounded-full bg-indigo-500/10 blur-[80px]" />
                        </div>

                        <div className="relative flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-violet-300">
                                    <Sparkles size={14} /> Ruang Produktivitas NeuroDesk
                                </div>
                                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Selamat pagi, {displayName} <span className="ml-2">✦</span></h1>
                                <p className="mt-2 text-sm text-gray-400">Rencanakan. Fokus. Raih tujuan. Jadikan hari ini bermakna.</p>
                            </div>

                            {/* NOTIFICATION BELL */}
                            <div ref={bellRef} className="relative shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setBellOpen((open) => !open)}
                                    aria-label="Buka notifikasi"
                                    aria-haspopup="true"
                                    aria-expanded={bellOpen}
                                    className={`relative flex size-11 items-center justify-center rounded-xl border transition ${bellOpen ? 'border-violet-400/40 bg-violet-500/15 text-violet-200' : 'border-white/10 bg-black/20 text-gray-300 hover:border-violet-400/30 hover:text-violet-300'}`}
                                >
                                    <Bell size={19} />
                                    {reminderTasks.length > 0 && (
                                        <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full border border-[#0c0c13] bg-rose-500 px-1 text-[10px] font-semibold leading-5 text-white">
                                            {reminderTasks.length > 9 ? '9+' : reminderTasks.length}
                                        </span>
                                    )}
                                </button>

                                {bellOpen && (
                                    <div className="absolute right-0 top-full z-40 mt-3 w-[calc(100vw-5rem)] max-w-sm overflow-hidden rounded-2xl border border-violet-400/20 bg-[#11111b]/95 shadow-2xl shadow-violet-900/30 backdrop-blur-xl">
                                        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                                <Bell size={15} className="text-violet-300" /> Notifikasi
                                            </div>
                                            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${reminderTasks.length ? 'border-rose-400/20 bg-rose-500/10 text-rose-300' : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300'}`}>
                                                {reminderTasks.length} reminder
                                            </span>
                                        </div>

                                        {reminderTasks.length === 0 ? (
                                            <div className="px-4 py-8 text-center">
                                                <CheckCircle2 size={26} className="mx-auto text-emerald-400" />
                                                <p className="mt-3 text-sm text-gray-300">Tidak ada deadline yang mendesak.</p>
                                                <p className="mt-1 text-xs text-gray-500">Kamu aman untuk {reminderDays} hari ke depan.</p>
                                            </div>
                                        ) : (
                                            <div className="max-h-80 space-y-1 overflow-y-auto p-2">
                                                {reminderTasks.map((task) => {
                                                    const meta = getReminderMeta(task.daysLeft);
                                                    return (
                                                        <div key={`bell-${task.id}`} className="flex items-start gap-3 rounded-xl p-3 transition hover:bg-white/[0.04]">
                                                            <span className={`mt-1.5 size-2 shrink-0 rounded-full ${meta.dot}`} />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-medium text-gray-200">{task.title}</p>
                                                                <p className="mt-1 text-xs text-gray-500">Deadline: {formatTanggal(task.due_date)}</p>
                                                                <span className={`mt-2 inline-block rounded-md border px-2 py-0.5 text-[10px] ${meta.tone}`}>{meta.label}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="relative mt-6 flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-gray-300"><Search size={16} /> Ruang produktivitasmu</div>
                            <div className="flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-2.5 text-sm text-violet-300"><Zap size={16} /> Ruang kerja aktif</div>
                        </div>
                    </header>

                    {/* STATISTIK */}
                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <MetricCard title="Total Tugas" value={taskStats.total} subtitle="Semua tugas" icon={ListTodo} accent="bg-violet-500/15 text-violet-300" />
                        <MetricCard title="Tugas Selesai" value={taskStats.completed} subtitle={`${persentaseSelesai}% selesai`} icon={CheckCircle2} accent="bg-cyan-400/15 text-cyan-300" />
                        <MetricCard title="Belum Selesai" value={taskStats.pending} subtitle="Perlu dikerjakan" icon={Clock3} accent="bg-indigo-400/15 text-indigo-300" />
                        <MetricCard title="Sedang Dikerjakan" value={taskStats.in_progress} subtitle="Terus semangat" icon={Flame} accent="bg-orange-400/15 text-orange-300" />
                    </section>

                    {/* NOTIFICATION & REMINDER */}
                    <section className="rounded-2xl border border-violet-400/15 bg-gradient-to-br from-[#171323]/80 via-[#101019]/80 to-[#09090d]/80 p-5 backdrop-blur-xl sm:p-6">
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-violet-500/15 p-2.5 text-violet-300"><Bell size={19} /></div>
                                <div>
                                    <h2 className="font-semibold">Notifikasi & Reminder</h2>
                                    <p className="mt-1 text-xs text-gray-500">Pantau deadline tugas yang perlu perhatian dalam {reminderDays} hari ke depan.</p>
                                </div>
                            </div>
                            <span className={`rounded-full border px-3 py-1.5 text-xs font-medium ${reminderTasks.length ? 'border-rose-400/20 bg-rose-500/10 text-rose-300' : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300'}`}>
                                {reminderTasks.length} reminder
                            </span>
                        </div>

                        <div className="mb-4 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-xl border border-rose-400/15 bg-rose-500/[0.06] p-3">
                                <div className="flex items-center gap-2 text-xs text-rose-300"><AlertTriangle size={14} /> Terlewat</div>
                                <p className="mt-2 text-2xl font-semibold text-white">{overdueTasks.length}</p>
                            </div>
                            <div className="rounded-xl border border-amber-400/15 bg-amber-500/[0.06] p-3">
                                <div className="flex items-center gap-2 text-xs text-amber-300"><Clock3 size={14} /> Deadline hari ini</div>
                                <p className="mt-2 text-2xl font-semibold text-white">{dueTodayTasks.length}</p>
                            </div>
                            <div className="rounded-xl border border-cyan-400/15 bg-cyan-500/[0.06] p-3">
                                <div className="flex items-center gap-2 text-xs text-cyan-300"><CalendarClock size={14} /> {upcomingLabel}</div>
                                <p className="mt-2 text-2xl font-semibold text-white">{upcomingTasks.length}</p>
                            </div>
                        </div>

                        {reminderTasks.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-white/10 p-5 text-center">
                                <CheckCircle2 size={24} className="mx-auto text-emerald-400" />
                                <p className="mt-2 text-sm text-gray-300">Tidak ada deadline yang mendesak.</p>
                                <p className="mt-1 text-xs text-gray-500">Tugas dengan deadline lebih dari {reminderDays} hari lagi tidak ditampilkan di reminder.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {reminderTasks.slice(0, 5).map((task) => {
                                    const { label, tone } = getReminderMeta(task.daysLeft);
                                    return (
                                        <div key={`reminder-${task.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-black/20 p-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-gray-200">{task.title}</p>
                                                <p className="mt-1 text-xs text-gray-500">{formatTanggal(task.due_date)}</p>
                                            </div>
                                            <span className={`rounded-lg border px-2.5 py-1 text-xs ${tone}`}>{label}</span>
                                        </div>
                                    );
                                })}
                                {reminderTasks.length > 5 && <p className="pt-1 text-center text-xs text-gray-500">Dan {reminderTasks.length - 5} reminder lainnya…</p>}
                            </div>
                        )}
                    </section>

                    {/* KONTEN UTAMA */}
                    <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]">
                        {/* DAFTAR TUGAS */}
                        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-xl sm:p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="rounded-lg bg-violet-500/15 p-2 text-violet-300"><CheckCircle2 size={18} /></div>
                                        <h2 className="text-lg font-semibold">Tugas Saya</h2>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500">Tetap teratur dan selesaikan pekerjaanmu.</p>
                                </div>
                                <span className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400">{filteredTasks.length} dari {tasks.length} tugas</span>
                            </div>

                            {/* SEARCH DAN FILTER */}
                            <div className="mb-5 space-y-3 rounded-xl border border-violet-400/15 bg-black/20 p-4">
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Cari judul atau deskripsi tugas..."
                                        className={`${textInputClass} pl-10`}
                                    />
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={inputClass}>
                                        <option value="all">Semua status</option>
                                        <option value="pending">Belum Dikerjakan</option>
                                        <option value="in_progress">Sedang Dikerjakan</option>
                                        <option value="completed">Selesai</option>
                                    </select>
                                    <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className={inputClass}>
                                        <option value="all">Semua prioritas</option>
                                        <option value="low">Prioritas rendah</option>
                                        <option value="medium">Prioritas sedang</option>
                                        <option value="high">Prioritas tinggi</option>
                                    </select>
                                </div>
                                <button type="button" onClick={resetFilters} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-400 transition hover:border-violet-400/30 hover:text-violet-300">
                                    <RotateCcw size={13} /> Reset filter
                                </button>
                            </div>

                            <div className="space-y-2">
                                {filteredTasks.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center">
                                        <ListTodo size={32} className="mx-auto text-violet-400" />
                                        <p className="mt-3 text-sm font-medium text-gray-300">{tasks.length === 0 ? 'Belum ada tugas' : 'Tugas tidak ditemukan'}</p>
                                        <p className="mt-1 text-xs text-gray-500">{tasks.length === 0 ? 'Buat tugas pertamamu di bawah.' : 'Coba ubah kata pencarian atau filter.'}</p>
                                    </div>
                                ) : filteredTasks.map((task) => (
                                    <div key={task.id} className="group flex flex-wrap items-center gap-3 rounded-xl border border-transparent p-3 transition hover:border-white/[0.07] hover:bg-white/[0.025]">
                                        <button type="button" onClick={() => ubahStatusTugas(task)} className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition ${task.status === 'completed' ? 'border-violet-400 bg-violet-500 text-white' : 'border-gray-600 hover:border-violet-400'}`} aria-label="Ubah status tugas">
                                            {task.status === 'completed' && <Check size={12} />}
                                        </button>
                                        <div className="min-w-[55%] flex-1 sm:min-w-0">
                                            <p className={`truncate text-sm font-medium ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{task.title}</p>
                                            {task.description && <p className="mt-1 truncate text-xs text-gray-500">{task.description}</p>}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`rounded-md border px-2 py-1 text-[10px] ${statusStyles[task.status]}`}>{statusLabels[task.status]}</span>
                                            <span className={`rounded-md border px-2 py-1 text-[10px] ${priorityStyles[task.priority]}`}>{priorityLabels[task.priority]}</span>
                                            {task.due_date && <span className="text-xs text-gray-500">{formatTanggal(task.due_date)}</span>}
                                        </div>
                                        <button type="button" onClick={() => mulaiEditTugas(task)} className="rounded-lg p-2 text-gray-500 transition hover:bg-violet-500/10 hover:text-violet-300" aria-label="Edit tugas" title="Edit tugas"><Pencil size={15} /></button>
                                        <button type="button" onClick={() => hapusTugas(task)} className="rounded-lg p-2 text-gray-600 transition hover:bg-rose-500/10 hover:text-rose-400" aria-label="Hapus tugas" title="Hapus tugas"><Trash2 size={15} /></button>
                                    </div>
                                ))}
                            </div>

                            {/* FORM TAMBAH TUGAS */}
                            <form onSubmit={tambahTugas} className="mt-5 space-y-3 rounded-xl border border-violet-400/15 bg-black/20 p-4">
                                <div className="flex items-center gap-2 text-sm font-medium text-violet-300"><Plus size={16} /> Tambah Tugas Baru</div>
                                <input type="text" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} placeholder="Judul tugas..." required className={textInputClass} />
                                <textarea value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} placeholder="Deskripsi tugas (opsional)..." rows={2} className={`${textInputClass} resize-none`} />
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <select value={form.data.priority} onChange={(e) => form.setData('priority', e.target.value as 'low' | 'medium' | 'high')} className={inputClass}>
                                        <option value="low">Prioritas rendah</option><option value="medium">Prioritas sedang</option><option value="high">Prioritas tinggi</option>
                                    </select>
                                    <select value={form.data.status} onChange={(e) => form.setData('status', e.target.value as 'pending' | 'in_progress' | 'completed')} className={inputClass}>
                                        <option value="pending">Belum Dikerjakan</option><option value="in_progress">Sedang Dikerjakan</option><option value="completed">Selesai</option>
                                    </select>
                                </div>
                                <input type="date" value={form.data.due_date} onChange={(e) => form.setData('due_date', e.target.value)} className={inputClass} />
                                {form.errors.title && <p className="text-xs text-rose-400">{form.errors.title}</p>}
                                {form.errors.status && <p className="text-xs text-rose-400">{form.errors.status}</p>}
                                {form.errors.priority && <p className="text-xs text-rose-400">{form.errors.priority}</p>}
                                <button type="submit" disabled={form.processing} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-medium text-white shadow-lg shadow-violet-900/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50">
                                    <Plus size={16} /> {form.processing ? 'Menyimpan...' : 'Buat Tugas'}
                                </button>
                            </form>
                        </div>

                        {/* ASISTEN PRODUKTIVITAS */}
                        <div className="relative overflow-hidden rounded-2xl border border-violet-400/15 bg-gradient-to-br from-[#171323] via-[#101019] to-[#09090d] p-5 backdrop-blur-xl sm:p-6">
                            <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-violet-500/15 blur-3xl" />
                            <div className="relative">
                                <div className="mb-6 flex items-center gap-2">
                                    <div className="rounded-xl bg-violet-500/15 p-2.5 text-violet-300"><BrainCircuit size={19} /></div>
                                    <div><h2 className="font-semibold">Asisten Produktivitas</h2><p className="text-xs text-violet-300/70">Ringkasan dari tugasmu</p></div>
                                </div>
                                <div className="mb-5 flex items-center gap-2 text-xs text-gray-400"><Sparkles size={14} className="text-violet-300" /> Ringkasan produktivitasmu</div>
                                <h3 className="text-xl font-semibold leading-relaxed">{insight.headline}</h3>
                                <p className="mt-3 text-sm leading-6 text-gray-400">{insight.advice}</p>

                                {insight.focusTask && (
                                    <div className="mt-5 rounded-xl border border-violet-400/10 bg-violet-500/5 p-4">
                                        <div className="flex items-center gap-2 text-xs text-violet-300"><Target size={14} /> Fokus berikutnya</div>
                                        <p className="mt-2 truncate text-sm font-medium text-gray-200">{insight.focusTask.title}</p>
                                        <p className="mt-1 text-xs text-gray-500">{insight.focusTask.note}</p>
                                    </div>
                                )}

                                <div className="mt-5 rounded-xl border border-white/[0.06] bg-black/20 p-4">
                                    <div className="mb-3 flex items-center justify-between text-xs"><span className="text-gray-400">Progres penyelesaian tugas</span><span className="font-medium text-violet-300">{persentaseSelesai}%</span></div>
                                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-400 transition-all duration-500" style={{ width: `${persentaseSelesai}%` }} /></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* BAGIAN BAWAH */}
                    <section className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:items-start">
                        <WorkspaceCalendar tasks={tasks} />
                        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-xl sm:p-6">
                            <div className="mb-5 flex items-center gap-2"><LayoutDashboard size={18} className="text-fuchsia-300" /><h2 className="text-lg font-semibold">Aksi Cepat</h2></div>
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => document.querySelector<HTMLInputElement>('input[placeholder="Judul tugas..."]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="flex flex-col items-center gap-3 rounded-xl border border-violet-400/10 bg-violet-500/[0.06] p-5 text-violet-300 transition hover:border-violet-400/30 hover:bg-violet-500/10"><ListTodo size={22} /><span className="text-sm font-medium">Tambah Tugas</span></button>
                                <button type="button" onClick={bukaPengaturan} className="flex flex-col items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-gray-400 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-300"><Settings size={22} /><span className="text-sm font-medium">Pengaturan Ruang Kerja</span></button>
                            </div>
                            <div className="mt-5 rounded-xl bg-gradient-to-r from-violet-500/10 to-indigo-500/10 p-4"><div className="flex items-center gap-2 text-xs text-violet-300"><Target size={14} /> Ruang Kerja NeuroDesk</div><p className="mt-2 text-xs leading-5 text-gray-500">Satu ruang untuk tugas, ide, jadwal, dan fokusmu.</p></div>
                        </div>
                    </section>
                </div>
            </div>

            {/* MODAL EDIT TUGAS */}
            {editingTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) tutupModalEdit(); }}>
                    <form onSubmit={simpanEditTugas} className="my-auto w-full max-w-lg space-y-4 rounded-2xl border border-violet-400/20 bg-[#11111b] p-6 shadow-2xl shadow-violet-900/20">
                        <div className="flex items-center justify-between">
                            <div><div className="flex items-center gap-2 text-violet-300"><Pencil size={17} /><h2 className="text-lg font-semibold text-white">Edit Tugas</h2></div><p className="mt-1 text-xs text-gray-500">Ubah detail tugas sesuai kebutuhanmu.</p></div>
                            <button type="button" onClick={tutupModalEdit} className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white" aria-label="Tutup modal edit"><X size={18} /></button>
                        </div>
                        <div><label className="mb-2 block text-xs text-gray-400">Judul Tugas</label><input type="text" value={editForm.data.title} onChange={(e) => editForm.setData('title', e.target.value)} required placeholder="Judul tugas..." className={textInputClass} />{editForm.errors.title && <p className="mt-1 text-xs text-rose-400">{editForm.errors.title}</p>}</div>
                        <div><label className="mb-2 block text-xs text-gray-400">Deskripsi</label><textarea value={editForm.data.description} onChange={(e) => editForm.setData('description', e.target.value)} rows={3} placeholder="Deskripsi tugas..." className={`${textInputClass} resize-none`} /></div>
                        <div><label className="mb-2 block text-xs text-gray-400">Prioritas</label><select value={editForm.data.priority} onChange={(e) => editForm.setData('priority', e.target.value as 'low' | 'medium' | 'high')} className={inputClass}><option value="low">Prioritas rendah</option><option value="medium">Prioritas sedang</option><option value="high">Prioritas tinggi</option></select>{editForm.errors.priority && <p className="mt-1 text-xs text-rose-400">{editForm.errors.priority}</p>}</div>
                        <div><label className="mb-2 block text-xs text-gray-400">Status Tugas</label><select value={editForm.data.status} onChange={(e) => editForm.setData('status', e.target.value as 'pending' | 'in_progress' | 'completed')} className={inputClass}><option value="pending">Belum Dikerjakan</option><option value="in_progress">Sedang Dikerjakan</option><option value="completed">Selesai</option></select>{editForm.errors.status && <p className="mt-1 text-xs text-rose-400">{editForm.errors.status}</p>}</div>
                        <div><label className="mb-2 block text-xs text-gray-400">Deadline</label><input type="date" value={editForm.data.due_date} onChange={(e) => editForm.setData('due_date', e.target.value)} className={inputClass} />{editForm.errors.due_date && <p className="mt-1 text-xs text-rose-400">{editForm.errors.due_date}</p>}</div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={tutupModalEdit} disabled={editForm.processing} className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] py-3 text-sm font-medium text-gray-300 transition hover:bg-white/[0.07] disabled:opacity-50">Batal</button>
                            <button type="submit" disabled={editForm.processing} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-medium text-white shadow-lg shadow-violet-900/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50">{editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODAL PENGATURAN RUANG KERJA */}
            {settingsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) tutupPengaturan(); }}>
                    <form onSubmit={simpanPengaturan} className="my-auto w-full max-w-lg space-y-4 rounded-2xl border border-violet-400/20 bg-[#11111b] p-6 shadow-2xl shadow-violet-900/20">
                        <div className="flex items-center justify-between">
                            <div><div className="flex items-center gap-2 text-violet-300"><Settings size={17} /><h2 className="text-lg font-semibold text-white">Pengaturan Ruang Kerja</h2></div><p className="mt-1 text-xs text-gray-500">Sesuaikan sapaan dan reminder deadline.</p></div>
                            <button type="button" onClick={tutupPengaturan} className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white" aria-label="Tutup pengaturan"><X size={18} /></button>
                        </div>
                        <div>
                            <label className="mb-2 block text-xs text-gray-400">Nama Panggilan</label>
                            <input type="text" value={settingsForm.data.display_name} onChange={(e) => settingsForm.setData('display_name', e.target.value)} maxLength={50} placeholder="Althaf" className={textInputClass} />
                            <p className="mt-1 text-xs text-gray-600">Dipakai pada sapaan di header. Kosongkan untuk memakai nama bawaan.</p>
                            {settingsForm.errors.display_name && <p className="mt-1 text-xs text-rose-400">{settingsForm.errors.display_name}</p>}
                        </div>
                        <div>
                            <label className="mb-2 block text-xs text-gray-400">Rentang Reminder (hari)</label>
                            <input type="number" min={1} max={14} value={settingsForm.data.reminder_days} onChange={(e) => settingsForm.setData('reminder_days', Number(e.target.value))} className={inputClass} />
                            <p className="mt-1 text-xs text-gray-600">Tugas masuk reminder dan lonceng jika deadline-nya dalam rentang ini (1–14 hari).</p>
                            {settingsForm.errors.reminder_days && <p className="mt-1 text-xs text-rose-400">{settingsForm.errors.reminder_days}</p>}
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={tutupPengaturan} disabled={settingsForm.processing} className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] py-3 text-sm font-medium text-gray-300 transition hover:bg-white/[0.07] disabled:opacity-50">Batal</button>
                            <button type="submit" disabled={settingsForm.processing} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-medium text-white shadow-lg shadow-violet-900/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50">{settingsForm.processing ? 'Menyimpan...' : 'Simpan Pengaturan'}</button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dasbor', href: dashboard() }],
};