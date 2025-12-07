<?php

namespace App\GraphQL\Mutations;

use App\Services\CsvStorageService;
use App\Services\EmailService;

class AdminReplyMutation
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
        // Input is in $args['input']
        $input = $args['input'];
        
        // Get session from CSV
        $session = $this->csvService->readSession($input['session_id']);
        if (!$session) {
            throw new \Exception("Session not found: {$input['session_id']}");
        }
        
        // Update session assigned admin if not set
        if (empty($session['assigned_admin'])) {
            $this->csvService->createOrUpdateSession([
                'session_id' => $input['session_id'],
                'assigned_admin' => $input['admin_name'],
            ]);
            $session = $this->csvService->readSession($input['session_id']);
        }
        
        // Save message to CSV FIRST (encrypted)
        $messageData = $this->csvService->addMessage($input['session_id'], [
            'type' => 'admin',
            'text' => $input['message'],
            'admin_name' => $input['admin_name'],
            'admin_email' => $input['admin_email'],
            'admin_avatar' => $input['admin_avatar'] ?? null,
        ]);
        
        // Send email notification AFTER message is saved
        try {
            $messageObj = (object)[
                'id' => md5($input['session_id'] . $messageData['created_at']),
                'session_id' => $input['session_id'],
                'type' => 'admin',
                'text' => $input['message'],
                'admin_name' => $input['admin_name'],
                'admin_email' => $input['admin_email'],
                'admin_avatar' => $input['admin_avatar'] ?? null,
            ];
            
            $sessionObj = (object)$session;
            $this->emailService->sendAdminReplyNotification($messageObj, $sessionObj);
        } catch (\Exception $e) {
            // Log error but don't fail the mutation
            \Log::error("Failed to send admin reply email: " . $e->getMessage());
        }
        
        // Convert ISO8601 to DateTime format for GraphQL
        $createdAt = $messageData['created_at'] ?? now()->toIso8601String();
        $createdAtFormatted = \Carbon\Carbon::parse($createdAt)->format('Y-m-d H:i:s');
        
        // Return message in expected format
        return [
            'id' => md5($input['session_id'] . $createdAt),
            'session_id' => $input['session_id'],
            'type' => 'admin',
            'text' => $input['message'],
            'admin_name' => $input['admin_name'],
            'admin_email' => $input['admin_email'],
            'admin_avatar' => $input['admin_avatar'] ?? null,
            'created_at' => $createdAtFormatted,
            'timestamp' => strtotime($createdAt) * 1000,
        ];
    }
}

