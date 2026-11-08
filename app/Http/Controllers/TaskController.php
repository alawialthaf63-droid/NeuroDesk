<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\WorkspaceSetting;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    /**
     * Menampilkan task, statistik, dan pengaturan ke Dashboard.
     */
    public function index(Request $request): Response
    {
        $tasks = Task::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        $setting = WorkspaceSetting::where('user_id', $request->user()->id)->first();

        return Inertia::render('dashboard', [
            'tasks' => $tasks,

            'taskStats' => [
                'total' => $tasks->count(),

                'completed' => $tasks
                    ->where('status', 'completed')
                    ->count(),

                'pending' => $tasks
                    ->where('status', 'pending')
                    ->count(),

                'in_progress' => $tasks
                    ->where('status', 'in_progress')
                    ->count(),
            ],

            'settings' => [
                'display_name' => $setting?->display_name,
                'reminder_days' => $setting?->reminder_days ?? 3,
            ],
        ]);
    }

    /**
     * Menambahkan task baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['required', 'in:low,medium,high'],
            'status' => ['required', 'in:pending,in_progress,completed'],
            'due_date' => ['nullable', 'date'],
        ]);

        Task::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return back()->with('success', 'Task berhasil ditambahkan!');
    }

    /**
     * Mengubah task.
     */
    public function update(Request $request, Task $task): RedirectResponse
    {
        $this->authorizeTask($request, $task);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['required', 'in:low,medium,high'],
            'status' => ['required', 'in:pending,in_progress,completed'],
            'due_date' => ['nullable', 'date'],
        ]);

        $task->update($validated);

        return back()->with('success', 'Task berhasil diperbarui!');
    }

    /**
     * Menghapus task.
     */
    public function destroy(Request $request, Task $task): RedirectResponse
    {
        $this->authorizeTask($request, $task);

        $task->delete();

        return back()->with('success', 'Task berhasil dihapus!');
    }

    /**
     * Mengubah status task menjadi selesai atau pending.
     */
    public function toggleComplete(
        Request $request,
        Task $task
    ): RedirectResponse {
        $this->authorizeTask($request, $task);

        $task->update([
            'status' => $task->status === 'completed'
                ? 'pending'
                : 'completed',
        ]);

        return back()->with('success', 'Status task berhasil diubah!');
    }

    /**
     * Memastikan task hanya dapat diakses oleh pemiliknya.
     */
    private function authorizeTask(Request $request, Task $task): void
    {
        abort_unless(
            (int) $task->user_id === (int) $request->user()->id,
            403
        );
    }
}