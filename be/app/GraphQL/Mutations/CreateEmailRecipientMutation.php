<?php

namespace App\GraphQL\Mutations;

use App\Services\EmailRecipientCsvService;

class CreateEmailRecipientMutation
{
    protected $csvService;

    public function __construct(EmailRecipientCsvService $csvService)
    {
        $this->csvService = $csvService;
    }

    public function __invoke($root, array $args)
    {
        $input = $args['input'];
        
        return $this->csvService->create($input);
    }
}

