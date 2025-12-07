<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'name',
        'email',
        'whatsapp',
        'environment',
        'assigned_admin',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function messages()
    {
        return $this->hasMany(Message::class, 'session_id', 'session_id');
    }

    public function getUnreadCountAttribute()
    {
        return $this->messages()
            ->where('type', 'user')
            ->where('read_at', null)
            ->count();
    }
}

