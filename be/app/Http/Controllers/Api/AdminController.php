<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Session;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function reply(Request $request)
    {
        $validated = $request->validate([
            'sessionId' => 'required|string',
            'message' => 'required|string',
            'adminName' => 'required|string|max:255',
            'adminEmail' => 'required|email|max:255',
            'adminAvatar' => 'nullable|string|max:10',
            'environment' => 'nullable|string|max:50',
        ]);

        $session = Session::where('session_id', $validated['sessionId'])->first();

        if (!$session) {
            return response()->json([
                'error' => 'Session not found',
            ], 404);
        }

        // Assign admin if not already assigned
        if (!$session->assigned_admin) {
            $session->update([
                'assigned_admin' => $validated['adminName'],
            ]);
        }

        $message = Message::create([
            'session_id' => $validated['sessionId'],
            'type' => 'admin',
            'text' => $validated['message'],
            'admin_name' => $validated['adminName'],
            'admin_email' => $validated['adminEmail'],
            'admin_avatar' => $validated['adminAvatar'] ?? '👤',
        ]);

        return response()->json([
            'success' => true,
            'message' => $message,
        ], 201);
    }

    public function finishSession(Request $request)
    {
        $validated = $request->validate([
            'sessionId' => 'required|string',
        ]);

        $session = Session::where('session_id', $validated['sessionId'])->first();

        if (!$session) {
            return response()->json([
                'error' => 'Session not found',
            ], 404);
        }

        $session->update([
            'status' => 'finished',
        ]);

        return response()->json([
            'success' => true,
            'session' => $session,
        ]);
    }

    public function sessions()
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

