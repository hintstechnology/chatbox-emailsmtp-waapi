<?php

namespace App\Services;

use Carbon\Carbon;

class EmailRecipientCsvService
{
    protected $basePath;
    protected $csvFile;

    public function __construct()
    {
        $this->basePath = base_path('database');
        $this->csvFile = $this->basePath . '/email_recipients.csv';
        
        // Ensure directory exists
        if (!file_exists($this->basePath)) {
            mkdir($this->basePath, 0755, true);
        }
        
        // Create file with header if it doesn't exist
        if (!file_exists($this->csvFile)) {
            $this->initializeFile();
        }
    }

    /**
     * Initialize CSV file with header
     */
    protected function initializeFile()
    {
        $handle = fopen($this->csvFile, 'w');
        fputcsv($handle, ['id', 'email', 'name', 'is_active', 'is_primary', 'created_at', 'updated_at']);
        fclose($handle);
    }


    /**
     * Get all email recipients
     */
    public function getAll()
    {
        $recipients = [];
        
        if (!file_exists($this->csvFile)) {
            return $recipients;
        }
        
        if (($handle = fopen($this->csvFile, 'r')) !== false) {
            $isFirstRow = true;
            while (($row = fgetcsv($handle)) !== false) {
                if ($isFirstRow) {
                    $isFirstRow = false;
                    continue;
                }
                
                if (count($row) < 7) continue;
                
                // Convert ISO8601 to DateTime format if needed
                $createdAt = $row[5] ?? Carbon::now()->format('Y-m-d H:i:s');
                $updatedAt = $row[6] ?? Carbon::now()->format('Y-m-d H:i:s');
                
                // If ISO8601 format, convert to Y-m-d H:i:s
                if (strpos($createdAt, 'T') !== false) {
                    $createdAt = Carbon::parse($createdAt)->format('Y-m-d H:i:s');
                }
                if (strpos($updatedAt, 'T') !== false) {
                    $updatedAt = Carbon::parse($updatedAt)->format('Y-m-d H:i:s');
                }
                
                $recipients[] = [
                    'id' => $row[0],
                    'email' => $row[1] ?? '',
                    'name' => $row[2] ?? '',
                    'is_active' => $row[3] === '1' || $row[3] === 'true',
                    'is_primary' => $row[4] === '1' || $row[4] === 'true',
                    'created_at' => $createdAt,
                    'updated_at' => $updatedAt,
                ];
            }
            fclose($handle);
        }
        
        return $recipients;
    }

    /**
     * Get active email recipients
     */
    public function getActive()
    {
        return array_filter($this->getAll(), function($recipient) {
            return $recipient['is_active'] === true;
        });
    }

    /**
     * Find email recipient by ID
     */
    public function find($id)
    {
        $recipients = $this->getAll();
        foreach ($recipients as $recipient) {
            if ($recipient['id'] === $id) {
                return $recipient;
            }
        }
        return null;
    }

    /**
     * Find email recipient by email
     */
    public function findByEmail($email)
    {
        $recipients = $this->getAll();
        foreach ($recipients as $recipient) {
            if ($recipient['email'] === $email) {
                return $recipient;
            }
        }
        return null;
    }

    /**
     * Create email recipient
     */
    public function create($data)
    {
        $id = (string)(time() . '_' . mt_rand(1000, 9999));
        $now = Carbon::now()->toIso8601String();
        
        // Format DateTime for GraphQL (Y-m-d H:i:s)
        $nowFormatted = Carbon::now()->format('Y-m-d H:i:s');
        
        $recipient = [
            'id' => $id,
            'email' => $data['email'] ?? '',
            'name' => $data['name'] ?? null,
            'is_active' => $data['is_active'] ?? true,
            'is_primary' => $data['is_primary'] ?? false,
            'created_at' => $nowFormatted,
            'updated_at' => $nowFormatted,
        ];
        
        // If setting as primary, unset others
        if ($recipient['is_primary']) {
            $this->unsetPrimary();
        }
        
        // Check if email already exists
        $existing = $this->findByEmail($recipient['email']);
        if ($existing) {
            throw new \Exception("Email already exists: {$recipient['email']}");
        }
        
        // Write to CSV
        $handle = fopen($this->csvFile, 'a');
        fputcsv($handle, [
            $recipient['id'],
            $recipient['email'],
            $recipient['name'] ?? '',
            $recipient['is_active'] ? '1' : '0',
            $recipient['is_primary'] ? '1' : '0',
            $recipient['created_at'],
            $recipient['updated_at'],
        ]);
        fclose($handle);
        
        return $recipient;
    }

    /**
     * Update email recipient
     */
    public function update($id, $data)
    {
        $recipients = $this->getAll();
        $found = false;
        
        foreach ($recipients as $index => $recipient) {
            if ($recipient['id'] === $id) {
                $found = true;
                
                // Update fields
                if (isset($data['email'])) {
                    // Check if new email already exists
                    $existing = $this->findByEmail($data['email']);
                    if ($existing && $existing['id'] !== $id) {
                        throw new \Exception("Email already exists: {$data['email']}");
                    }
                    $recipients[$index]['email'] = $data['email'];
                }
                if (isset($data['name'])) {
                    $recipients[$index]['name'] = $data['name'];
                }
                if (isset($data['is_active'])) {
                    $recipients[$index]['is_active'] = $data['is_active'];
                }
                if (isset($data['is_primary'])) {
                    $recipients[$index]['is_primary'] = $data['is_primary'];
                    // If setting as primary, unset others
                    if ($data['is_primary']) {
                        foreach ($recipients as $i => $r) {
                            if ($i !== $index) {
                                $recipients[$i]['is_primary'] = false;
                            }
                        }
                    }
                }
                
                $recipients[$index]['updated_at'] = Carbon::now()->format('Y-m-d H:i:s');
                break;
            }
        }
        
        if (!$found) {
            throw new \Exception("Email recipient not found: {$id}");
        }
        
        // Rewrite entire file
        $this->writeAll($recipients);
        
        return $recipients[array_search($id, array_column($recipients, 'id'))];
    }

    /**
     * Delete email recipient
     */
    public function delete($id)
    {
        $recipients = $this->getAll();
        $found = false;
        
        foreach ($recipients as $index => $recipient) {
            if ($recipient['id'] === $id) {
                $found = true;
                unset($recipients[$index]);
                break;
            }
        }
        
        if (!$found) {
            throw new \Exception("Email recipient not found: {$id}");
        }
        
        // Rewrite file without deleted recipient
        $this->writeAll(array_values($recipients));
        
        return true;
    }

    /**
     * Set primary email recipient
     */
    public function setPrimary($id)
    {
        $recipients = $this->getAll();
        $found = false;
        
        foreach ($recipients as $index => $recipient) {
            if ($recipient['id'] === $id) {
                $found = true;
                // Unset all primary
                foreach ($recipients as $i => $r) {
                    $recipients[$i]['is_primary'] = false;
                }
                // Set this one as primary and active
                $recipients[$index]['is_primary'] = true;
                $recipients[$index]['is_active'] = true;
                $recipients[$index]['updated_at'] = Carbon::now()->format('Y-m-d H:i:s');
                break;
            }
        }
        
        if (!$found) {
            throw new \Exception("Email recipient not found: {$id}");
        }
        
        $this->writeAll($recipients);
        
        return $recipients[array_search($id, array_column($recipients, 'id'))];
    }

    /**
     * Unset primary from all recipients
     */
    protected function unsetPrimary()
    {
        $recipients = $this->getAll();
        foreach ($recipients as $index => $recipient) {
            $recipients[$index]['is_primary'] = false;
        }
        $this->writeAll($recipients);
    }

    /**
     * Write all recipients to CSV
     */
    protected function writeAll($recipients)
    {
        $handle = fopen($this->csvFile, 'w');
        fputcsv($handle, ['id', 'email', 'name', 'is_active', 'is_primary', 'created_at', 'updated_at']);
        
        foreach ($recipients as $recipient) {
            fputcsv($handle, [
                $recipient['id'],
                $recipient['email'],
                $recipient['name'] ?? '',
                $recipient['is_active'] ? '1' : '0',
                $recipient['is_primary'] ? '1' : '0',
                $recipient['created_at'],
                $recipient['updated_at'],
            ]);
        }
        
        fclose($handle);
    }
}

