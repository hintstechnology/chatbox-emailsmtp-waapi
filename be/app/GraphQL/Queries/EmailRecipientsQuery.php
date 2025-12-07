<?php

namespace App\GraphQL\Queries;

use App\Services\EmailRecipientCsvService;

class EmailRecipientsQuery
{
    protected $csvService;

    public function __construct(EmailRecipientCsvService $csvService)
    {
        $this->csvService = $csvService;
    }

    public function __invoke($root, array $args)
    {
        return $this->csvService->getAll();
    }
}

