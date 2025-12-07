<?php

namespace App\GraphQL\Mutations;

use App\Services\CsvStorageService;

class CreateSessionMutation
{
    protected $csvService;

    public function __construct(CsvStorageService $csvService)
    {
        $this->csvService = $csvService;
    }

    public function __invoke($root, array $args)
    {
        try {
            \Log::info("CreateSessionMutation - Start");
            \Log::info("CreateSessionMutation - Args: " . json_encode($args));
            
            // Input is in $args['input'] (without @spread)
            if (!isset($args['input'])) {
                \Log::error("Input parameter missing. Args: " . json_encode($args));
                throw new \Exception("Input parameter is required");
            }
            
            $input = $args['input'];
            \Log::info("CreateSessionMutation - Input: " . json_encode($input));
            
            // Validate required fields
            if (empty($input['session_id']) || empty($input['name']) || empty($input['email']) || empty($input['whatsapp'])) {
                \Log::error("Missing required fields. Input: " . json_encode($input));
                throw new \Exception("Required fields: session_id, name, email, whatsapp");
            }
            
            $sessionDataToCreate = [
                'session_id' => $input['session_id'],
                'name' => $input['name'],
                'email' => $input['email'],
                'whatsapp' => $input['whatsapp'],
                'environment' => $input['environment'] ?? 'testing-mock',
                'status' => $input['status'] ?? 'active',
                'created_at' => now()->toIso8601String(),
            ];
            
            \Log::info("CreateSessionMutation - Creating session with data: " . json_encode($sessionDataToCreate));
            
            // Create or update session in CSV
            $sessionData = $this->csvService->createOrUpdateSession($sessionDataToCreate);
            
            \Log::info("CreateSessionMutation - Session created: " . json_encode($sessionData));
            
            if (!$sessionData) {
                \Log::error("CreateSessionMutation - Failed to create session, returned null");
                throw new \Exception("Failed to create session");
            }
            
            \Log::info("CreateSessionMutation - Session ID from created data: " . ($sessionData['session_id'] ?? 'NOT FOUND'));
            
            // Convert to format expected by GraphQL
            $createdAt = $sessionData['created_at'] ?? now()->toIso8601String();
            $updatedAt = $sessionData['updated_at'] ?? now()->toIso8601String();
            
            // Convert ISO8601 to DateTime format for GraphQL
            $createdAtFormatted = \Carbon\Carbon::parse($createdAt)->format('Y-m-d H:i:s');
            $updatedAtFormatted = \Carbon\Carbon::parse($updatedAt)->format('Y-m-d H:i:s');
            
            return [
                'id' => md5($sessionData['session_id']),
                'session_id' => $sessionData['session_id'],
                'name' => $sessionData['name'],
                'email' => $sessionData['email'],
                'whatsapp' => $sessionData['whatsapp'],
                'environment' => $sessionData['environment'] ?? 'testing-mock',
                'assigned_admin' => $sessionData['assigned_admin'] ?? null,
                'status' => $sessionData['status'] ?? 'active',
                'created_at' => $createdAtFormatted,
                'updated_at' => $updatedAtFormatted,
            ];
        } catch (\Exception $e) {
            \Log::error("CreateSessionMutation error: " . $e->getMessage());
            \Log::error("Args: " . json_encode($args));
            throw $e;
        }
    }
}

