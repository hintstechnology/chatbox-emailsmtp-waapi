<?php

namespace App\GraphQL\Mutations;

use App\Services\CsvStorageService;

class DeleteSessionMutation
{
    protected $csvService;

    public function __construct(CsvStorageService $csvService)
    {
        $this->csvService = $csvService;
    }

    public function __invoke($root, array $args)
    {
        $sessionId = $args['sessionId'];
        
        try {
            $this->csvService->deleteSession($sessionId);
            return true;
        } catch (\Exception $e) {
            \Log::error("DeleteSessionMutation error: " . $e->getMessage());
            throw new \Exception("Failed to delete session: " . $e->getMessage());
        }
    }
}

