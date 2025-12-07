<?php

namespace App\GraphQL\Mutations;

use App\Services\EmailRecipientCsvService;

class DeleteEmailRecipientMutation
{
    protected $csvService;

    public function __construct(EmailRecipientCsvService $csvService)
    {
        $this->csvService = $csvService;
    }

    public function __invoke($root, array $args)
    {
        $id = $args['id'];
        
        // Get recipient before deleting
        $recipient = $this->csvService->find($id);
        if (!$recipient) {
            throw new \Exception("Email recipient not found: {$id}");
        }
        
        $this->csvService->delete($id);
        
        // Return deleted recipient data
        return $recipient;
    }
}

