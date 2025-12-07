<?php

namespace App\GraphQL\Queries;

use App\Services\CsvStorageService;

class MessagesQuery
{
    protected $csvService;

    public function __construct(CsvStorageService $csvService)
    {
        $this->csvService = $csvService;
    }

    public function __invoke($root, array $args)
    {
        try {
            \Log::info("MessagesQuery - Start");
            \Log::info("MessagesQuery - Args: " . json_encode($args));
            
            $sessionId = $args['sessionId'] ?? null;
            if (!$sessionId) {
                \Log::warning("MessagesQuery - No sessionId provided");
                return [];
            }
            
            \Log::info("MessagesQuery - Reading session: {$sessionId}");
            $session = $this->csvService->readSession($sessionId);
            
            if (!$session) {
                \Log::warning("MessagesQuery - Session not found: {$sessionId}");
                return [];
            }
            
            $messages = $session['messages'] ?? [];
            \Log::info("MessagesQuery - Found " . count($messages) . " messages");
            
            // Convert to expected format
            $formattedMessages = array_map(function ($msg) {
                try {
                    // Convert ISO8601 to DateTime format for GraphQL
                    $createdAt = $msg['created_at'] ?? now()->toIso8601String();
                    $updatedAt = $msg['updated_at'] ?? now()->toIso8601String();
                    $readAt = $msg['read_at'] ?? null;
                    
                    try {
                        $createdAtFormatted = \Carbon\Carbon::parse($createdAt)->format('Y-m-d H:i:s');
                    } catch (\Exception $e) {
                        \Log::warning("MessagesQuery - Failed to parse created_at: {$createdAt}");
                        $createdAtFormatted = now()->format('Y-m-d H:i:s');
                    }
                    
                    try {
                        $updatedAtFormatted = \Carbon\Carbon::parse($updatedAt)->format('Y-m-d H:i:s');
                    } catch (\Exception $e) {
                        \Log::warning("MessagesQuery - Failed to parse updated_at: {$updatedAt}");
                        $updatedAtFormatted = now()->format('Y-m-d H:i:s');
                    }
                    
                    $readAtFormatted = null;
                    if ($readAt) {
                        try {
                            $readAtFormatted = \Carbon\Carbon::parse($readAt)->format('Y-m-d H:i:s');
                        } catch (\Exception $e) {
                            \Log::warning("MessagesQuery - Failed to parse read_at: {$readAt}");
                        }
                    }
                    
                    $timestamp = time() * 1000;
                    try {
                        $timestamp = strtotime($createdAt) * 1000;
                    } catch (\Exception $e) {
                        \Log::warning("MessagesQuery - Failed to parse timestamp from created_at: {$createdAt}");
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
                } catch (\Exception $e) {
                    \Log::error("MessagesQuery - Error formatting message: " . $e->getMessage());
                    return null;
                }
            }, $messages);
            
            // Filter out null messages
            $formattedMessages = array_filter($formattedMessages);
            
            \Log::info("MessagesQuery - Returning " . count($formattedMessages) . " formatted messages");
            return array_values($formattedMessages);
        } catch (\Exception $e) {
            \Log::error("MessagesQuery - Error: " . $e->getMessage());
            \Log::error("MessagesQuery - Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }
}

