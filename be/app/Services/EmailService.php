<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class EmailService
{
    /**
     * Send email notification for new user message
     */
    public function sendNewMessageNotification($message, $session)
    {
        try {
            // Get recipients from CSV (emails selected in admin frontend)
            $csvService = app(\App\Services\EmailRecipientCsvService::class);
            $recipients = collect($csvService->getActive());
            if ($recipients->isEmpty()) {
                Log::warning("No active email recipients found for new message notification.");
                return false;
            }

            $sessionName = is_object($session) ? $session->name : ($session['name'] ?? 'Unknown');
            $sessionId = is_object($session) ? $session->session_id : ($session['session_id'] ?? '');
            $sessionEmail = is_object($session) ? $session->email : ($session['email'] ?? '');
            $sessionWhatsapp = is_object($session) ? $session->whatsapp : ($session['whatsapp'] ?? '');
            $messageText = is_object($message) ? $message->text : ($message['text'] ?? '');
            $messageId = is_object($message) ? ($message->id ?? '') : ($message['id'] ?? '');

            $subject = "New Message from {$sessionName} - Session: {$sessionId}";

            $data = [
                'session' => $session,
                'message' => $message,
                'userName' => $sessionName,
                'userEmail' => $sessionEmail,
                'userWhatsapp' => $sessionWhatsapp,
                'messageText' => $messageText,
                'sessionId' => $sessionId,
            ];

            foreach ($recipients as $recipient) {
                $recipientEmail = is_array($recipient) ? ($recipient['email'] ?? '') : ($recipient->email ?? '');
                $recipientName = is_array($recipient) ? ($recipient['name'] ?? null) : ($recipient->name ?? null);
                
                if (empty($recipientEmail)) continue;
                
                Mail::send('emails.new-message', $data, function ($mail) use ($recipientEmail, $recipientName, $subject, $sessionEmail, $sessionName) {
                    $mail->to($recipientEmail, $recipientName)
                         ->subject($subject)
                         ->replyTo($sessionEmail, $sessionName);
                });
            }

            Log::info("Email notification sent for message ID: {$messageId} to active recipients.");
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to send email notification: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send email notification for admin reply to user
     */
    public function sendAdminReplyNotification($message, $session)
    {
        try {
            $toEmail = is_object($session) ? $session->email : ($session['email'] ?? '');
            $sessionName = is_object($session) ? $session->name : ($session['name'] ?? 'Unknown');
            $sessionId = is_object($session) ? $session->session_id : ($session['session_id'] ?? '');
            $adminName = is_object($message) ? $message->admin_name : ($message['admin_name'] ?? 'Admin');
            $adminEmail = is_object($message) ? $message->admin_email : ($message['admin_email'] ?? '');
            $replyText = is_object($message) ? $message->text : ($message['text'] ?? '');
            $messageId = is_object($message) ? ($message->id ?? '') : ($message['id'] ?? '');

            if (!$toEmail) {
                throw new \Exception("Session email not found");
            }

            $subject = "Reply from {$adminName} - Your Chat Session";

            $data = [
                'session' => $session,
                'message' => $message,
                'adminName' => $adminName,
                'adminEmail' => $adminEmail,
                'replyText' => $replyText,
                'sessionId' => $sessionId,
            ];

            Mail::send('emails.admin-reply', $data, function ($mail) use ($toEmail, $subject, $sessionName, $adminEmail, $adminName) {
                $mail->to($toEmail, $sessionName)
                     ->subject($subject)
                     ->replyTo($adminEmail, $adminName);
            });

            Log::info("Admin reply email sent to: {$toEmail} for message ID: {$messageId}");
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to send admin reply email: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send session summary email when session is finished
     */
    public function sendSessionFinishedNotification($session)
    {
        try {
            $sessionId = is_object($session) ? $session->session_id : ($session['session_id'] ?? '');
            $toEmail = is_object($session) ? $session->email : ($session['email'] ?? '');
            $userName = is_object($session) ? $session->name : ($session['name'] ?? '');
            
            if (!$toEmail) {
                throw new \Exception("Session email not found");
            }
            
            $subject = "Your Chat Session Has Been Completed";
            
            // Get messages from CSV
            $csvService = app(\App\Services\CsvStorageService::class);
            $sessionData = $csvService->readSession($sessionId);
            $messages = $sessionData['messages'] ?? [];
            
            // Sort by created_at
            usort($messages, function($a, $b) {
                return strtotime($a['created_at'] ?? 0) - strtotime($b['created_at'] ?? 0);
            });

            $data = [
                'session' => $session,
                'messages' => $messages,
                'userName' => $userName,
            ];

            Mail::send('emails.session-finished', $data, function ($mail) use ($toEmail, $subject, $userName) {
                $mail->to($toEmail, $userName)
                     ->subject($subject);
            });

            Log::info("Session finished email sent to: {$toEmail} for session: {$sessionId}");
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to send session finished email: " . $e->getMessage());
            return false;
        }
    }
}

