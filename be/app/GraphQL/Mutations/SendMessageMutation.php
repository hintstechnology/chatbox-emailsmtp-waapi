<?php

namespace App\GraphQL\Mutations;

use App\Services\CsvStorageService;
use App\Services\EmailService;

class SendMessageMutation
{
    protected $csvService;
    protected $emailService;

    public function __construct(CsvStorageService $csvService, EmailService $emailService)
    {
        $this->csvService = $csvService;
        $this->emailService = $emailService;
    }

    public function __invoke($root, array $args)
    {
        \Log::info("SendMessageMutation - Start");
        \Log::info("SendMessageMutation - Args: " . json_encode($args));
        
        // Input is in $args['input']
        $input = $args['input'];
        \Log::info("SendMessageMutation - Input: " . json_encode($input));
        
        $sessionId = $input['session_id'] ?? null;
        \Log::info("SendMessageMutation - Session ID: {$sessionId}");
        
        // Get session from CSV
        \Log::info("SendMessageMutation - Attempting to read session from CSV");
        $session = $this->csvService->readSession($sessionId);
        
        if (!$session) {
            \Log::error("SendMessageMutation - Session not found: {$sessionId}");
            \Log::error("SendMessageMutation - Base path: " . base_path('database'));
            \Log::error("SendMessageMutation - Files in database: " . json_encode(glob(base_path('database') . '/*.csv')));
            throw new \Exception("Session not found: {$sessionId}");
        }
        
        \Log::info("SendMessageMutation - Session found: " . json_encode($session));
        
        // Save message to CSV FIRST (encrypted)
        $messageData = $this->csvService->addMessage($input['session_id'], [
            'type' => $input['type'] ?? 'user',
            'text' => $input['text'],
        ]);
        
        // Send email notification AFTER message is saved (only for user messages)
        if (($input['type'] ?? 'user') === 'user') {
            try {
                // Create message object for email service
                $messageObj = (object)[
                    'id' => md5($input['session_id'] . $messageData['created_at']),
                    'session_id' => $input['session_id'],
                    'type' => $input['type'] ?? 'user',
                    'text' => $input['text'],
                ];
                
                $sessionObj = (object)$session;
                $this->emailService->sendNewMessageNotification($messageObj, $sessionObj);
            } catch (\Exception $e) {
                // Log error but don't fail the mutation
                \Log::error("Failed to send new message email: " . $e->getMessage());
            }
        }
        
        // Convert ISO8601 to DateTime format for GraphQL
        $createdAt = $messageData['created_at'] ?? now()->toIso8601String();
        $createdAtFormatted = \Carbon\Carbon::parse($createdAt)->format('Y-m-d H:i:s');
        
        // Return message in expected format
        return [
            'id' => md5($input['session_id'] . $createdAt),
            'session_id' => $input['session_id'],
            'type' => $input['type'] ?? 'user',
            'text' => $input['text'],
            'created_at' => $createdAtFormatted,
            'timestamp' => strtotime($createdAt) * 1000,
        ];
    }
}

