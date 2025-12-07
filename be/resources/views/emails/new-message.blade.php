<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Message Notification</title>
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
            background-color: #10b981;
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
            border-left: 4px solid #10b981;
            margin: 15px 0;
        }
        .info {
            background-color: #eff6ff;
            padding: 15px;
            border-radius: 5px;
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
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #10b981;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>New Message Received</h2>
    </div>
    
    <div class="content">
        <p>Hello Admin,</p>
        
        <p>You have received a new message from a customer:</p>
        
        <div class="message-box">
            <strong>Message:</strong><br>
            {{ $messageText }}
        </div>
        
        <div class="info">
            <strong>Customer Information:</strong><br>
            Name: {{ $userName }}<br>
            Email: {{ $userEmail }}<br>
            WhatsApp: {{ $userWhatsapp }}<br>
            Session ID: {{ $sessionId }}
        </div>
        
        <p>Please log in to the admin panel to reply to this message.</p>
        
        <a href="{{ config('app.url') }}/admin" class="button">View in Admin Panel</a>
    </div>
    
    <div class="footer">
        <p>This is an automated notification from the Chat System.</p>
        <p>Please do not reply to this email directly.</p>
    </div>
</body>
</html>

