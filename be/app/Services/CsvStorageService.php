<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class CsvStorageService
{
    protected $basePath;

    public function __construct()
    {
        // Use root database folder as requested: root/database/
        $this->basePath = base_path('database');
        
        // Ensure directory exists
        if (!file_exists($this->basePath)) {
            mkdir($this->basePath, 0755, true);
        }
    }

    /**
     * Get CSV file path for a session
     * Format: [datetime]-[chatbox email]-[session]-chathistory.csv
     */
    protected function getSessionFilePath($sessionId, $chatboxEmail, $createdAt = null)
    {
        $datetime = null;
        if (!empty($createdAt)) {
            try {
                $datetime = Carbon::parse($createdAt)->format('Y-m-d_H-i-s');
            } catch (\Exception $e) {
                \Log::warning("Invalid created_at format in getSessionFilePath '{$createdAt}', using current time. Error: " . $e->getMessage());
                $datetime = Carbon::now()->format('Y-m-d_H-i-s');
            }
        } else {
            $datetime = Carbon::now()->format('Y-m-d_H-i-s');
        }
        
        $safeEmail = preg_replace('/[^a-zA-Z0-9@._-]/', '_', $chatboxEmail);
        $safeSession = preg_replace('/[^a-zA-Z0-9_-]/', '_', $sessionId);

        $filename = "{$datetime}-{$safeEmail}-{$safeSession}-chathistory.csv";
        return $this->basePath . '/' . $filename;
    }

    /**
     * Find CSV file by session ID
     */
    protected function findSessionFile($sessionId)
    {
        \Log::info("CsvStorageService::findSessionFile - Looking for session: {$sessionId}");
        \Log::info("CsvStorageService::findSessionFile - Base path: {$this->basePath}");
        
        // Try multiple patterns to find the file by filename
        $patterns = [
            $this->basePath . '/*-*-' . preg_quote($sessionId, '/') . '-chathistory.csv',
            $this->basePath . '/*-*-' . str_replace(['_', '-'], ['*', '*'], preg_quote($sessionId, '/')) . '-chathistory.csv',
        ];
        
        foreach ($patterns as $index => $pattern) {
            \Log::info("CsvStorageService::findSessionFile - Trying pattern {$index}: {$pattern}");
            $files = glob($pattern);
            \Log::info("CsvStorageService::findSessionFile - Pattern {$index} found " . count($files) . " files");
            if (!empty($files)) {
                \Log::info("CsvStorageService::findSessionFile - Found file by pattern: {$files[0]}");
                return $files[0];
            }
        }
        
        // If not found by filename, search all CSV files and check metadata
        \Log::info("CsvStorageService::findSessionFile - Pattern search failed, searching all CSV files");
        $allFiles = glob($this->basePath . '/*-*-*-chathistory.csv');
        if (empty($allFiles)) {
            // Try without pattern restriction
            $allFiles = glob($this->basePath . '/*.csv');
        }
        
        \Log::info("CsvStorageService::findSessionFile - Found " . count($allFiles) . " CSV files total");
        
        foreach ($allFiles as $file) {
            // Check metadata in file to find matching session ID
            $fileSessionId = $this->extractSessionIdFromMetadata($file);
            \Log::info("CsvStorageService::findSessionFile - File: " . basename($file) . " -> Session ID: " . ($fileSessionId ?: 'NULL'));
            if ($fileSessionId === $sessionId) {
                \Log::info("CsvStorageService::findSessionFile - MATCH FOUND: {$file}");
                return $file;
            }
        }
        
        \Log::warning("CsvStorageService::findSessionFile - Session not found: {$sessionId}");
        return null;
    }

    /**
     * Extract session ID from file metadata (more reliable)
     */
    protected function extractSessionIdFromMetadata($filePath)
    {
        if (!file_exists($filePath)) {
            return null;
        }
        
        if (($handle = fopen($filePath, 'r')) !== false) {
            $isFirstRow = true;
            while (($row = fgetcsv($handle)) !== false) {
                // Skip header row
                if ($isFirstRow) {
                    $isFirstRow = false;
                    continue;
                }
                
                if (count($row) < 2) continue;
                
                // Check if this is metadata row
                if (isset($row[0]) && $row[0] === '#METADATA#') {
                    $sessionId = $row[1] ?? '';
                    fclose($handle);
                    return $sessionId;
                }
            }
            fclose($handle);
        }
        
        return null;
    }


    /**
     * Create or update session
     */
    public function createOrUpdateSession($sessionData)
    {
        \Log::info("CsvStorageService::createOrUpdateSession - Start");
        \Log::info("CsvStorageService::createOrUpdateSession - Session data: " . json_encode($sessionData));
        
        $sessionId = $sessionData['session_id'];
        $chatboxEmail = $sessionData['email'] ?? 'unknown';
        $createdAtRaw = $sessionData['created_at'] ?? null;
        
        // Validate and format created_at
        $createdAt = null;
        if (!empty($createdAtRaw)) {
            try {
                $createdAt = Carbon::parse($createdAtRaw)->toIso8601String();
            } catch (\Exception $e) {
                \Log::warning("Invalid created_at format '{$createdAtRaw}', using current time. Error: " . $e->getMessage());
                $createdAt = Carbon::now()->toIso8601String();
            }
        } else {
            $createdAt = Carbon::now()->toIso8601String();
        }
        
        \Log::info("CsvStorageService::createOrUpdateSession - Session ID: {$sessionId}");
        \Log::info("CsvStorageService::createOrUpdateSession - Email: {$chatboxEmail}");
        \Log::info("CsvStorageService::createOrUpdateSession - Created At: {$createdAt}");
        
        $filePath = $this->findSessionFile($sessionId);
        \Log::info("CsvStorageService::createOrUpdateSession - Existing file path: " . ($filePath ?: 'NOT FOUND'));
        
        if (!$filePath) {
            // Create new file with time series format
            $filePath = $this->getSessionFilePath($sessionId, $chatboxEmail, $createdAt);
            
            // Ensure directory exists
            $dir = dirname($filePath);
            if (!file_exists($dir)) {
                mkdir($dir, 0755, true);
            }
            
            // Create file and write header for time series format: timestamp, username, message
            $handle = fopen($filePath, 'w');
            if (!$handle) {
                \Log::error("CsvStorageService::createOrUpdateSession - Failed to open file for writing: {$filePath}");
                throw new \Exception("Failed to create session file");
            }
            
            // Write header row: timestamp,username,message
            fputcsv($handle, ['timestamp', 'username', 'message']);
            
            // Write metadata row: #METADATA#,session_id,name,email,whatsapp,environment,assigned_admin,status,created_at,updated_at
            $metadataRow = [
                '#METADATA#',
                $sessionId,
                $sessionData['name'] ?? '',
                $sessionData['email'] ?? '',
                $sessionData['whatsapp'] ?? '',
                $sessionData['environment'] ?? 'testing-mock',
                $sessionData['assigned_admin'] ?? '',
                $sessionData['status'] ?? 'active',
                $createdAt,
                $createdAt, // updated_at same as created_at initially
            ];
            fputcsv($handle, $metadataRow);
            
            fclose($handle);
            
            \Log::info("CsvStorageService::createOrUpdateSession - File created successfully: {$filePath}");
            
            // Verify file was created
            if (!file_exists($filePath)) {
                \Log::error("CsvStorageService::createOrUpdateSession - File verification failed: {$filePath}");
                throw new \Exception("Failed to verify session file creation");
            }
            
            return;
        }
        
        // Update existing file metadata
        // Read existing file
        $existingData = $this->readSession($sessionId);
        if (!$existingData) {
            \Log::error("CsvStorageService::createOrUpdateSession - Failed to read existing session for update");
            return;
        }
        
        // Update metadata in file
        $this->updateSessionInFile($filePath, $sessionData);
        
        \Log::info("CsvStorageService::createOrUpdateSession - Session updated successfully");
    }
    
    /**
     * Update session metadata in existing CSV file
     * Uses fputcsv for consistent CSV formatting
     */
    protected function updateSessionInFile($filePath, $sessionData)
    {
        if (!file_exists($filePath)) {
            \Log::error("CsvStorageService::updateSessionInFile - File not found: {$filePath}");
            return;
        }
        
        // Read all rows using fgetcsv for proper parsing
        $rows = [];
        $metadataIndex = -1;
        
        $handle = fopen($filePath, 'r');
        if (!$handle) {
            \Log::error("CsvStorageService::updateSessionInFile - Failed to open file for reading: {$filePath}");
            return;
        }
        
        $rowIndex = 0;
        while (($row = fgetcsv($handle)) !== false) {
            if (isset($row[0]) && $row[0] === '#METADATA#') {
                $metadataIndex = $rowIndex;
            }
            $rows[] = $row;
            $rowIndex++;
        }
        fclose($handle);
        
        if ($metadataIndex === -1) {
            \Log::warning("CsvStorageService::updateSessionInFile - Metadata row not found, appending");
            // If metadata not found, append it (shouldn't happen, but handle gracefully)
            $handle = fopen($filePath, 'a');
            if ($handle) {
                $metadataRow = [
                    '#METADATA#',
                    $sessionData['session_id'] ?? '',
                    $sessionData['name'] ?? '',
                    $sessionData['email'] ?? '',
                    $sessionData['whatsapp'] ?? '',
                    $sessionData['environment'] ?? 'testing-mock',
                    $sessionData['assigned_admin'] ?? '',
                    $sessionData['status'] ?? 'active',
                    $sessionData['created_at'] ?? now()->toIso8601String(),
                    $sessionData['updated_at'] ?? now()->toIso8601String(),
                ];
                fputcsv($handle, $metadataRow);
                fclose($handle);
            }
            return;
        }
        
        // Update metadata row
        $sessionId = $sessionData['session_id'] ?? ($rows[$metadataIndex][1] ?? '');
        $createdAt = $sessionData['created_at'] ?? ($rows[$metadataIndex][8] ?? now()->toIso8601String());
        $updatedAt = $sessionData['updated_at'] ?? now()->toIso8601String();
        
        $metadataRow = [
            '#METADATA#',
            $sessionId,
            $sessionData['name'] ?? ($rows[$metadataIndex][2] ?? ''),
            $sessionData['email'] ?? ($rows[$metadataIndex][3] ?? ''),
            $sessionData['whatsapp'] ?? ($rows[$metadataIndex][4] ?? ''),
            $sessionData['environment'] ?? ($rows[$metadataIndex][5] ?? 'testing-mock'),
            $sessionData['assigned_admin'] ?? ($rows[$metadataIndex][6] ?? ''),
            $sessionData['status'] ?? ($rows[$metadataIndex][7] ?? 'active'),
            $createdAt,
            $updatedAt,
        ];
        
        // Replace metadata row
        $rows[$metadataIndex] = $metadataRow;
        
        // Write all rows back using fputcsv
        $handle = fopen($filePath, 'w');
        if ($handle) {
            foreach ($rows as $row) {
                fputcsv($handle, $row);
            }
            fclose($handle);
        } else {
            \Log::error("CsvStorageService::updateSessionInFile - Failed to open file for writing: {$filePath}");
        }
    }
    
    /**
     * Write CSV row (for messages)
     * Uses fputcsv to ensure proper CSV formatting (handles quotes, commas, etc.)
     */
    protected function writeCsvRow($filePath, $row)
    {
        $handle = fopen($filePath, 'a');
        if ($handle) {
            // Use fputcsv to ensure proper CSV formatting (handles quotes, commas, etc.)
            fputcsv($handle, $row);
            fclose($handle);
        } else {
            \Log::error("CsvStorageService::writeCsvRow - Failed to open file for appending: {$filePath}");
        }
    }
    
    /**
     * Write CSV row (OLD - duplicate, keeping for reference but should use writeCsvRow above)
     */
    protected function writeCsvRowOld($filePath, $data)
    {
        // This method is deprecated - use writeCsvRow instead
        return $this->writeCsvRow($filePath, $data);
    }

    /**
     * Add message to session (time series format)
     */
    public function addMessage($sessionId, $messageData)
    {
        \Log::info("CsvStorageService::addMessage - Start");
        \Log::info("CsvStorageService::addMessage - Session ID: {$sessionId}");
        \Log::info("CsvStorageService::addMessage - Message data: " . json_encode($messageData));
        \Log::info("CsvStorageService::addMessage - Base path: {$this->basePath}");
        
        $filePath = $this->findSessionFile($sessionId);
        \Log::info("CsvStorageService::addMessage - Found file path: " . ($filePath ?: 'NULL'));
        
        if (!$filePath) {
            // Log for debugging
            \Log::error("CsvStorageService::addMessage - Session file not found for session: {$sessionId}");
            \Log::error("CsvStorageService::addMessage - Base path: {$this->basePath}");
            $allFiles = glob($this->basePath . '/*.csv');
            \Log::error("CsvStorageService::addMessage - All CSV files in directory: " . json_encode($allFiles));
            if (!empty($allFiles)) {
                foreach ($allFiles as $file) {
                    $extractedId = $this->extractSessionIdFromMetadata($file);
                    \Log::error("CsvStorageService::addMessage - File: " . basename($file) . " -> Session ID: " . ($extractedId ?: 'NOT FOUND'));
                }
            }
            throw new \Exception("Session not found: {$sessionId}");
        }
        
        // Determine username based on message type
        $username = 'User';
        if (($messageData['type'] ?? 'user') === 'admin') {
            $username = $messageData['admin_name'] ?? 'Admin';
        } else {
            // Get user name from session metadata without reading all messages (to avoid recursion)
            $username = $this->getSessionName($filePath) ?? 'User';
        }
        
        // Format timestamp as readable datetime
        $timestamp = Carbon::now()->format('Y-m-d H:i:s');
        
        // Time series format: timestamp, username, message
        $messageRow = [
            $timestamp,
            $username,
            $messageData['text'] ?? '', // Chat bubble content
        ];
        
        $this->writeCsvRow($filePath, $messageRow);
        
        // Return in format expected by GraphQL
        $createdAt = Carbon::now()->toIso8601String();
        return [
            'session_id' => $sessionId,
            'type' => $messageData['type'] ?? 'user', // Use 'type' not 'message_type'
            'text' => $messageData['text'] ?? '',
            'admin_name' => $messageData['admin_name'] ?? null,
            'admin_email' => $messageData['admin_email'] ?? null,
            'admin_avatar' => $messageData['admin_avatar'] ?? null,
            'read_at' => $messageData['read_at'] ?? null,
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ];
    }

    /**
     * Get session name from file without reading all messages (optimized)
     */
    protected function getSessionName($filePath)
    {
        if (!file_exists($filePath)) {
            return null;
        }
        
        if (($handle = fopen($filePath, 'r')) !== false) {
            $isFirstRow = true;
            while (($row = fgetcsv($handle)) !== false) {
                // Skip header row
                if ($isFirstRow) {
                    $isFirstRow = false;
                    continue;
                }
                
                if (count($row) < 2) continue;
                
                // Check if this is metadata row
                if (isset($row[0]) && $row[0] === '#METADATA#') {
                    $name = $row[2] ?? '';
                    fclose($handle);
                    return $name;
                }
            }
            fclose($handle);
        }
        
        return null;
    }

    /**
     * Read session and messages (time series format)
     */
    public function readSession($sessionId)
    {
        try {
            \Log::info("CsvStorageService::readSession - Start");
            \Log::info("CsvStorageService::readSession - Session ID: {$sessionId}");
            
            $filePath = $this->findSessionFile($sessionId);
            
            if (!$filePath) {
                \Log::warning("CsvStorageService::readSession - File not found for session: {$sessionId}");
                return null;
            }
            
            \Log::info("CsvStorageService::readSession - File found: {$filePath}");
            
            $session = null;
            $messages = [];
            
            if (($handle = fopen($filePath, 'r')) !== false) {
            $isFirstRow = true;
            $rowIndex = 0;
            
            while (($row = fgetcsv($handle)) !== false) {
                $rowIndex++;
                
                // Skip header row (timestamp, username, message)
                if ($isFirstRow) {
                    $isFirstRow = false;
                    continue;
                }
                
                if (count($row) < 1) continue;
                
                // Check if this is metadata row
                if (isset($row[0]) && $row[0] === '#METADATA#') {
                    // Parse metadata (handle both old format without dates and new format with dates)
                    $session = [
                        'session_id' => $row[1] ?? $sessionId,
                        'name' => $row[2] ?? '',
                        'email' => $row[3] ?? '',
                        'whatsapp' => $row[4] ?? '',
                        'environment' => $row[5] ?? 'testing-mock',
                        'assigned_admin' => $row[6] ?? null,
                        'status' => $row[7] ?? 'active',
                        'created_at' => isset($row[8]) && !empty($row[8]) ? $row[8] : now()->toIso8601String(),
                        'updated_at' => isset($row[9]) && !empty($row[9]) ? $row[9] : now()->toIso8601String(),
                    ];
                    
                    \Log::info("CsvStorageService::readSession - Metadata parsed: " . json_encode($session));
                } else {
                    // This is a message row (time series format: timestamp, username, message)
                    if (count($row) >= 3) {
                        $timestamp = $row[0] ?? '';
                        $username = $row[1] ?? 'Unknown';
                        $messageText = $row[2] ?? '';
                        
                        // Skip if this is the header row (timestamp, username, message)
                        if (strtolower(trim($timestamp)) === 'timestamp' || 
                            strtolower(trim($username)) === 'username' || 
                            strtolower(trim($messageText)) === 'message') {
                            continue;
                        }
                        
                        // Validate timestamp - must be a valid date string
                        if (empty($timestamp) || strtolower(trim($timestamp)) === 'timestamp') {
                            $timestamp = Carbon::now()->format('Y-m-d H:i:s');
                        }
                        
                        // Determine message type based on username
                        $messageType = 'user';
                        $adminName = null;
                        $adminEmail = null;
                        $adminAvatar = null;
                        
                        if ($username !== 'User' && $username !== ($session['name'] ?? 'User')) {
                            $messageType = 'admin';
                            $adminName = $username;
                        }
                        
                        // Convert timestamp to ISO8601 for compatibility
                        try {
                            $createdAt = Carbon::parse($timestamp)->toIso8601String();
                        } catch (\Exception $e) {
                            \Log::warning("Failed to parse timestamp '{$timestamp}', using current time. Error: " . $e->getMessage());
                            $createdAt = Carbon::now()->toIso8601String();
                        }
                        
                        $messages[] = [
                            'session_id' => $sessionId,
                            'type' => $messageType,
                            'text' => $messageText,
                            'admin_name' => $adminName,
                            'admin_email' => $adminEmail,
                            'admin_avatar' => $adminAvatar,
                            'read_at' => null,
                            'created_at' => $createdAt,
                            'updated_at' => $createdAt,
                        ];
                    }
                }
            }
                fclose($handle);
            } else {
                \Log::error("CsvStorageService::readSession - Failed to open file: {$filePath}");
            }
            
            if ($session) {
                $session['messages'] = $messages;
                \Log::info("CsvStorageService::readSession - Session found with " . count($messages) . " messages");
            } else {
                \Log::warning("CsvStorageService::readSession - Session metadata not found in file");
            }
            
            return $session;
        } catch (\Exception $e) {
            \Log::error("CsvStorageService::readSession - Error: " . $e->getMessage());
            \Log::error("CsvStorageService::readSession - Stack trace: " . $e->getTraceAsString());
            return null;
        }
    }

    /**
     * Get all sessions
     */
    public function getAllSessions()
    {
        $sessions = [];
        $files = glob($this->basePath . '/*-*-*-chathistory.csv');
        
        foreach ($files as $file) {
            $sessionId = $this->extractSessionIdFromFile($file);
            if ($sessionId) {
                $session = $this->readSession($sessionId);
                if ($session) {
                    $sessions[] = $session;
                }
            }
        }
        
        // Sort by created_at descending
        usort($sessions, function($a, $b) {
            return strtotime($b['created_at'] ?? 0) - strtotime($a['created_at'] ?? 0);
        });
        
        return $sessions;
    }

    /**
     * Update session status
     */
    public function updateSessionStatus($sessionId, $status)
    {
        $filePath = $this->findSessionFile($sessionId);
        
        if (!$filePath) {
            throw new \Exception("Session not found: {$sessionId}");
        }
        
        $this->updateSessionInFile($filePath, ['status' => $status]);
        
        return $this->readSession($sessionId);
    }

    /**
     * Delete session (delete CSV file)
     */
    public function deleteSession($sessionId)
    {
        $filePath = $this->findSessionFile($sessionId);
        
        if (!$filePath) {
            throw new \Exception("Session not found: {$sessionId}");
        }
        
        // Delete the CSV file
        if (file_exists($filePath)) {
            unlink($filePath);
            return true;
        }
        
        return false;
    }


    /**
     * Extract session ID from filename (fallback method)
     */
    protected function extractSessionIdFromFile($filePath)
    {
        // First try to get from metadata (more reliable)
        $sessionId = $this->extractSessionIdFromMetadata($filePath);
        if ($sessionId) {
            return $sessionId;
        }
        
        // Fallback: try to extract from filename
        $filename = basename($filePath);
        // Format: datetime-email-session-chathistory.csv
        if (preg_match('/-([^-]+)-chathistory\.csv$/', $filename, $matches)) {
            return $matches[1];
        }
        return null;
    }
}
