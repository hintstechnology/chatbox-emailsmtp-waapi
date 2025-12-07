<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reply from Support Team</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #3b82f6;
            color: white;
            padding: 20px;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f9fafb;
            padding: 20px;
            border: 1px solid #e5e7eb;
        }
        .message-box {
            background-color: white;
            padding: 15px;
            border-left: 4px solid #3b82f6;
            margin: 15px 0;
        }
        .footer {
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Reply from {{ $adminName }}</h2>
    </div>
    
    <div class="content">
        <p>Hello {{ $session->name }},</p>
        
        <p>You have received a reply from our support team:</p>
        
        <div class="message-box">
            {{ $replyText }}
        </div>
        
        <p>If you have any further questions, please feel free to continue the conversation.</p>
        
        <p>Best regards,<br>
        {{ $adminName }}<br>
        Support Team</p>
    </div>
    
    <div class="footer">
        <p>This is an automated email from the Chat System.</p>
        <p>Session ID: {{ $sessionId }}</p>
    </div>
</body>
</html>

