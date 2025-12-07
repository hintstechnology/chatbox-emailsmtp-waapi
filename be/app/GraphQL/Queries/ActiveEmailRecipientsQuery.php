<?php

namespace App\GraphQL\Queries;

use App\Services\EmailRecipientCsvService;

class ActiveEmailRecipientsQuery
{
    protected $csvService;

    public function __construct(EmailRecipientCsvService $csvService)
    {
        $this->csvService = $csvService;
    }

    public function __invoke($root, array $args)
    {
        $recipients = $this->csvService->getActive();
        
        // Sort by is_primary desc, then created_at asc
        usort($recipients, function($a, $b) {
            if ($a['is_primary'] !== $b['is_primary']) {
                return $b['is_primary'] ? 1 : -1;
            }
            return strtotime($a['created_at']) - strtotime($b['created_at']);
        });
        
        return array_values($recipients);
    }
}

