<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SessionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'sessionId' => 'required|string',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'whatsapp' => 'required|string|max:20',
            'environment' => 'nullable|string|max:50',
        ]);

        $session = Session::updateOrCreate(
            ['session_id' => $validated['sessionId']],
            [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'whatsapp' => $validated['whatsapp'],
                'environment' => $validated['environment'] ?? 'testing-mock',
                'status' => 'active',
            ]
        );

        return response()->json([
            'success' => true,
            'session' => $session,
        ], 201);
    }

    public function index()
    {
        $sessions = Session::with('messages')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($session) {
                return [
                    'sessionId' => $session->session_id,
                    'name' => $session->name,
                    'email' => $session->email,
                    'whatsapp' => $session->whatsapp,
                    'createdAt' => $session->created_at->toIso8601String(),
                    'assignedAdmin' => $session->assigned_admin,
                    'status' => $session->status,
                    'unreadCount' => $session->unread_count,
                ];
            });

        return response()->json([
            'sessions' => $sessions,
        ]);
    }
}

