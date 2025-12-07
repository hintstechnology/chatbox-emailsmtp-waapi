<?php

namespace App\GraphQL\Queries;

use App\Services\CsvStorageService;

class AdminSessionsQuery
{
    protected $csvService;

    public function __construct(CsvStorageService $csvService)
    {
        $this->csvService = $csvService;
    }

    public function __invoke($root, array $args)
    {
        $sessions = $this->csvService->getAllSessions();
        
        // Convert to expected format
        return array_map(function ($session) {
            $messages = $session['messages'] ?? [];
            $unreadCount = count(array_filter($messages, function($msg) {
                return ($msg['type'] ?? '') === 'user' && empty($msg['read_at']);
            }));
            
            // Convert ISO8601 to DateTime format for GraphQL
            $createdAt = $session['created_at'] ?? now()->toIso8601String();
            $updatedAt = $session['updated_at'] ?? now()->toIso8601String();
            $createdAtFormatted = \Carbon\Carbon::parse($createdAt)->format('Y-m-d H:i:s');
            $updatedAtFormatted = \Carbon\Carbon::parse($updatedAt)->format('Y-m-d H:i:s');
            
            return [
                'id' => md5($session['session_id']),
                'session_id' => $session['session_id'],
                'name' => $session['name'],
                'email' => $session['email'],
                'whatsapp' => $session['whatsapp'],
                'environment' => $session['environment'] ?? 'testing-mock',
                'assigned_admin' => $session['assigned_admin'] ?? null,
                'status' => $session['status'] ?? 'active',
                'created_at' => $createdAtFormatted,
                'updated_at' => $updatedAtFormatted,
                'unread_count' => $unreadCount,
            ];
        }, $sessions);
    }
}

