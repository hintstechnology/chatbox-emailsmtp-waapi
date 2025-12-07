<?php

namespace App\GraphQL\Fields;

use App\Services\CsvStorageService;

class SessionMessagesField
{
    protected $csvService;

    public function __construct(CsvStorageService $csvService)
    {
        $this->csvService = $csvService;
    }

    public function __invoke($root, array $args)
    {
        // $root is the Session array returned from SessionQuery
        $sessionId = $root['session_id'] ?? null;
        
        if (!$sessionId) {
            return [];
        }
        
        // Get messages from the session data (already included in SessionQuery result)
        $messages = $root['messages'] ?? [];
        
        // Format messages for GraphQL
        return array_map(function ($msg) {
            // Convert ISO8601 to DateTime format for GraphQL
            $createdAt = $msg['created_at'] ?? now()->toIso8601String();
            $updatedAt = $msg['updated_at'] ?? now()->toIso8601String();
            $readAt = $msg['read_at'] ?? null;
            
            try {
                $createdAtFormatted = \Carbon\Carbon::parse($createdAt)->format('Y-m-d H:i:s');
            } catch (\Exception $e) {
                $createdAtFormatted = now()->format('Y-m-d H:i:s');
            }
            
            try {
                $updatedAtFormatted = \Carbon\Carbon::parse($updatedAt)->format('Y-m-d H:i:s');
            } catch (\Exception $e) {
                $updatedAtFormatted = now()->format('Y-m-d H:i:s');
            }
            
            $readAtFormatted = null;
            if ($readAt) {
                try {
                    $readAtFormatted = \Carbon\Carbon::parse($readAt)->format('Y-m-d H:i:s');
                } catch (\Exception $e) {
                    // Ignore
                }
            }
            
            $timestamp = time() * 1000;
            try {
                $timestamp = strtotime($createdAt) * 1000;
            } catch (\Exception $e) {
                // Ignore
            }
            
            return [
                'id' => md5(($msg['session_id'] ?? '') . $createdAt),
                'session_id' => $msg['session_id'] ?? '',
                'type' => $msg['type'] ?? 'user',
                'text' => $msg['text'] ?? '',
                'admin_name' => $msg['admin_name'] ?? null,
                'admin_email' => $msg['admin_email'] ?? null,
                'admin_avatar' => $msg['admin_avatar'] ?? null,
                'read_at' => $readAtFormatted,
                'created_at' => $createdAtFormatted,
                'updated_at' => $updatedAtFormatted,
                'timestamp' => $timestamp,
            ];
        }, $messages);
    }
}

