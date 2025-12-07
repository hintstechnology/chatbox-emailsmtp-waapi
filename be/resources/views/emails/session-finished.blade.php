<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Session Completed</title>
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
            background-color: #8b5cf6;
            color: white;
            padding: 20px;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f9fafb;
            padding: 20px;
            border: 1px solid #e5e7eb;
        }
        .message {
            background-color: white;
            padding: 10px;
            margin: 10px 0;
            border-left: 3px solid #8b5cf6;
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
        <h2>Chat Session Completed</h2>
    </div>
    
    <div class="content">
        <p>Hello {{ $userName }},</p>
        
        <p>Your chat session has been marked as completed. Here's a summary of your conversation:</p>
        
        @foreach($messages as $msg)
        <div class="message">
            <strong>{{ $msg->type === 'user' ? 'You' : ($msg->admin_name ?? 'Support Team') }}:</strong><br>
            {{ $msg->text }}<br>
            <small>{{ $msg->created_at->format('M d, Y H:i') }}</small>
        </div>
        @endforeach
        
        <p>Thank you for contacting us. If you need further assistance, please start a new chat session.</p>
    </div>
    
    <div class="footer">
        <p>This is an automated email from the Chat System.</p>
        <p>Session ID: {{ $session->session_id }}</p>
    </div>
</body>
</html>

