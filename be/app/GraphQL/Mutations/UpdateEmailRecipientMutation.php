<?php

namespace App\GraphQL\Mutations;

use App\Services\EmailRecipientCsvService;

class UpdateEmailRecipientMutation
{
    protected $csvService;

    public function __construct(EmailRecipientCsvService $csvService)
    {
        $this->csvService = $csvService;
    }

    public function __invoke($root, array $args)
    {
        $id = $args['id'];
        $input = $args['input'];
        
        return $this->csvService->update($id, $input);
    }
}

