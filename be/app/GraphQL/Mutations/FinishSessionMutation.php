<?php

namespace App\GraphQL\Mutations;

use App\Services\CsvStorageService;
use App\Services\EmailService;

class FinishSessionMutation
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
        $session = $this->csvService->readSession($args['sessionId']);
        if (!$session) {
            throw new \Exception("Session not found: {$args['sessionId']}");
        }
        
        // Update status to finished
        $updatedSession = $this->csvService->updateSessionStatus($args['sessionId'], 'finished');
        
        // Send session finished email notification
        try {
            $sessionObj = (object)$updatedSession;
            $this->emailService->sendSessionFinishedNotification($sessionObj);
        } catch (\Exception $e) {
            // Log error but don't fail the mutation
            \Log::error("Failed to send session finished email: " . $e->getMessage());
        }
        
        // Return in expected format
        return [
            'id' => md5($updatedSession['session_id']),
            'session_id' => $updatedSession['session_id'],
            'status' => 'finished',
        ];
    }
}

