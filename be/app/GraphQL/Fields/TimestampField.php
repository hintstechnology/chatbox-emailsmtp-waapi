<?php

namespace App\GraphQL\Fields;

class TimestampField
{
    public function __invoke($root)
    {
        return $root->created_at->timestamp * 1000; // Convert to milliseconds
    }
}

