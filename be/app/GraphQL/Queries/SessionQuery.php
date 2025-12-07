<?php

namespace App\GraphQL\Queries;

use App\Services\CsvStorageService;

class SessionQuery
{
    protected $csvService;

    public function __construct(CsvStorageService $csvService)
    {
        $this->csvService = $csvService;
    }

    public function __invoke($root, array $args)
    {
        try {
            \Log::info("SessionQuery - Start");
            \Log::info("SessionQuery - Args: " . json_encode($args));
            
            $sessionId = $args['sessionId'] ?? null;
            if (!$sessionId) {
                \Log::warning("SessionQuery - No sessionId provided");
                return null;
            }
            
            \Log::info("SessionQuery - Reading session: {$sessionId}");
            $session = $this->csvService->readSession($sessionId);
            
            if (!$session) {
                \Log::warning("SessionQuery - Session not found: {$sessionId}");
                return null;
            }
            
            \Log::info("SessionQuery - Session found: " . json_encode($session));
            
            $messages = $session['messages'] ?? [];
            $unreadCount = count(array_filter($messages, function($msg) {
                return ($msg['type'] ?? '') === 'user' && empty($msg['read_at']);
            }));
            
            // Convert messages to expected format
            $formattedMessages = array_map(function ($msg) {
                try {
                    $createdAt = $msg['created_at'] ?? '';
                    $timestamp = time() * 1000;
                    
                    if (!empty($createdAt)) {
                        try {
                            $timestamp = strtotime($createdAt) * 1000;
                        } catch (\Exception $e) {
                            \Log::warning("SessionQuery - Failed to parse created_at: {$createdAt}");
                        }
                    }
                    
                    return [
                        'id' => md5(($msg['session_id'] ?? '') . $createdAt),
                        'type' => $msg['type'] ?? 'user',
                        'text' => $msg['text'] ?? '',
                        'admin_name' => $msg['admin_name'] ?? null,
                        'admin_email' => $msg['admin_email'] ?? null,
                        'admin_avatar' => $msg['admin_avatar'] ?? null,
                        'timestamp' => $timestamp,
                        'created_at' => $createdAt,
                    ];
                } catch (\Exception $e) {
                    \Log::error("SessionQuery - Error formatting message: " . $e->getMessage());
                    return null;
                }
            }, $messages);
            
            // Filter out null messages
            $formattedMessages = array_filter($formattedMessages);
            
            // Convert ISO8601 to DateTime format for GraphQL
            $createdAt = $session['created_at'] ?? now()->toIso8601String();
            $updatedAt = $session['updated_at'] ?? now()->toIso8601String();
            
            try {
                $createdAtFormatted = \Carbon\Carbon::parse($createdAt)->format('Y-m-d H:i:s');
            } catch (\Exception $e) {
                \Log::warning("SessionQuery - Failed to parse created_at: {$createdAt}, using now()");
                $createdAtFormatted = now()->format('Y-m-d H:i:s');
            }
            
            try {
                $updatedAtFormatted = \Carbon\Carbon::parse($updatedAt)->format('Y-m-d H:i:s');
            } catch (\Exception $e) {
                \Log::warning("SessionQuery - Failed to parse updated_at: {$updatedAt}, using now()");
                $updatedAtFormatted = now()->format('Y-m-d H:i:s');
            }
            
            $result = [
                'id' => md5($session['session_id'] ?? ''),
                'session_id' => $session['session_id'] ?? '',
                'name' => $session['name'] ?? '',
                'email' => $session['email'] ?? '',
                'whatsapp' => $session['whatsapp'] ?? '',
                'environment' => $session['environment'] ?? 'testing-mock',
                'assigned_admin' => $session['assigned_admin'] ?? null,
                'status' => $session['status'] ?? 'active',
                'created_at' => $createdAtFormatted,
                'updated_at' => $updatedAtFormatted,
                'messages' => array_values($formattedMessages),
                'unread_count' => $unreadCount,
            ];
            
            \Log::info("SessionQuery - Returning result");
            return $result;
        } catch (\Exception $e) {
            \Log::error("SessionQuery - Error: " . $e->getMessage());
            \Log::error("SessionQuery - Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }
}

