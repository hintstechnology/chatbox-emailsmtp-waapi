<?php

namespace App\GraphQL\Fields;

use App\Services\CsvStorageService;

class UnreadCountField
{
    protected $csvService;

    public function __construct(CsvStorageService $csvService)
    {
        $this->csvService = $csvService;
    }

    public function __invoke($root)
    {
        $sessionId = is_array($root) ? ($root['session_id'] ?? '') : ($root->session_id ?? '');
        if (!$sessionId) {
            return 0;
        }
        
        $session = $this->csvService->readSession($sessionId);
        if (!$session) {
            return 0;
        }
        
        $messages = $session['messages'] ?? [];
        $unreadCount = 0;
        
        foreach ($messages as $msg) {
            if (($msg['type'] ?? '') === 'user' && empty($msg['read_at'])) {
                $unreadCount++;
            }
        }
        
        return $unreadCount;
    }
}

