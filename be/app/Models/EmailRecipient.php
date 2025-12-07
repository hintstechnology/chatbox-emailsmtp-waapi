<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailRecipient extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'name',
        'is_active',
        'is_primary',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_primary' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get active recipients
     */
    public static function getActiveRecipients()
    {
        return static::where('is_active', true)->get();
    }

    /**
     * Get primary recipient
     */
    public static function getPrimaryRecipient()
    {
        return static::where('is_active', true)
            ->where('is_primary', true)
            ->first();
    }

    /**
     * Get all recipients for email notification
     */
    public static function getRecipientsForNotification()
    {
        $primary = static::getPrimaryRecipient();
        $others = static::where('is_active', true)
            ->where('is_primary', false)
            ->get();

        $recipients = collect();
        if ($primary) {
            $recipients->push($primary);
        }
        $recipients = $recipients->merge($others);

        return $recipients->pluck('email')->toArray();
    }
}

