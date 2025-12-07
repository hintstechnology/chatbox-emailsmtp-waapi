<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'type',
        'text',
        'admin_name',
        'admin_email',
        'admin_avatar',
        'read_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'read_at' => 'datetime',
    ];

    public function session()
    {
        return $this->belongsTo(Session::class, 'session_id', 'session_id');
    }
}

