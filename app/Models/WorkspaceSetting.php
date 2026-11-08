<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkspaceSetting extends Model
{
    protected $fillable = [
        'user_id',
        'display_name',
        'reminder_days',
    ];

    protected function casts(): array
    {
        return [
            'reminder_days' => 'integer',
        ];
    }

    /**
     * Pengaturan dimiliki oleh satu user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}