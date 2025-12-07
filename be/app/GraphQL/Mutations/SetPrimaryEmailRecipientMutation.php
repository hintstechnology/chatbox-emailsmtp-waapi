<?php

namespace App\GraphQL\Mutations;

use App\Services\EmailRecipientCsvService;

class SetPrimaryEmailRecipientMutation
{
    protected $csvService;

    public function __construct(EmailRecipientCsvService $csvService)
    {
        $this->csvService = $csvService;
    }

    public function __invoke($root, array $args)
    {
        $id = $args['id'];
        
        return $this->csvService->setPrimary($id);
    }
}

