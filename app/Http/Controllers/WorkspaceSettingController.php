<?php

namespace App\Http\Controllers;

use App\Models\WorkspaceSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class WorkspaceSettingController extends Controller
{
    /**
     * Menyimpan pengaturan ruang kerja milik user yang login.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'display_name' => ['nullable', 'string', 'max:50'],
            'reminder_days' => ['required', 'integer', 'min:1', 'max:14'],
        ]);

        WorkspaceSetting::updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated,
        );

        return back()->with('success', 'Pengaturan ruang kerja berhasil disimpan!');
    }
}