<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Session;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'sessionId' => 'required|string',
            'message' => 'required|string',
            'environment' => 'nullable|string|max:50',
        ]);

        // Ensure session exists
        $session = Session::firstOrCreate(
            ['session_id' => $validated['sessionId']],
            [
                'name' => 'Unknown',
                'email' => 'unknown@example.com',
                'whatsapp' => '',
                'environment' => $validated['environment'] ?? 'testing-mock',
                'status' => 'active',
            ]
        );

        $message = Message::create([
            'session_id' => $validated['sessionId'],
            'type' => 'user',
            'text' => $validated['message'],
        ]);

        return response()->json([
            'success' => true,
            'message' => $message,
        ], 201);
    }

    public function show($sessionId)
    {
        $session = Session::where('session_id', $sessionId)->first();

        if (!$session) {
            return response()->json([
                'messages' => [],
                'assignedAdmin' => null,
                'status' => 'active',
            ]);
        }

        $messages = Message::where('session_id', $sessionId)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($message) {
                return [
                    'type' => $message->type,
                    'text' => $message->text,
                    'timestamp' => $message->created_at->timestamp * 1000, // Convert to milliseconds
                    'adminName' => $message->admin_name,
                    'adminAvatar' => $message->admin_avatar,
                ];
            });

        return response()->json([
            'messages' => $messages,
            'assignedAdmin' => $session->assigned_admin,
            'status' => $session->status,
        ]);
    }
}

