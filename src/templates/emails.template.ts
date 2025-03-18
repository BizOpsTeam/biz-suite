
export const emailVerificationTemplate = (verficationUrl: string) => (`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .logo {
            max-width: 150px;
            margin-bottom: 20px;
        }
        h1 {
            color: #333;
        }
        p {
            color: #555;
            font-size: 16px;
            line-height: 1.5;
        }
        .button {
            display: inline-block;
            padding: 12px 20px;
            background: #007bff;
            color: #ffffff;
            text-decoration: none;
            font-size: 18px;
            border-radius: 5px;
            margin-top: 20px;
        }
        .button:hover {
            background: #0056b3;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="https://your-logo-url.com/logo.png" alt="Your Logo" class="logo">
        <h1>Verify Your Email</h1>
        <p>Thank you for signing up! Please confirm your email address by clicking the button below.</p>
        <a href={${verficationUrl}} class="button">Verify Email</a>
        <p>If you didn’t create an account, you can safely ignore this email.</p>
        <p class="footer">&copy; 2025 Your Company. All rights reserved.</p>
    </div>
</body>
</html>
`)

export const emailVerifiedSuccessfullyTemplate = () => (`
    <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Successfully Verified</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .logo {
            max-width: 150px;
            margin-bottom: 20px;
        }
        h1 {
            color: #333;
        }
        p {
            color: #555;
            font-size: 16px;
            line-height: 1.5;
        }
        .button {
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Successfully Verified</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .logo {
            max-width: 150px;
            margin-bottom: 20px;
        }
        h1 {
            color: #333;
        }
        p {
            color: #555;
            font-size: 16px;
            line-height: 1.5;
        }
        .button {
            display: inline-block;
            padding: 12px 20px;
            background: #28a745;
            color: #ffffff;
            text-decoration: none;
            font-size: 18px;
            border-radius: 5px;
            margin-top: 20px;
        }
        .button:hover {
            background: #218838;
        }
        .footer {
            margin-top: 20px;
        <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Successfully Verified</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .logo {
            max-width: 150px;
            margin-bottom: 20px;
        }
        h1 {
            color: #333;
        }
        p {
            color: #555;
            font-size: 16px;
            font-size: 14px;
            color: #777;
            padding: 12px 20px;
            background: #28a745;
            color: #ffffff;
            text-decoration: none;
            font-size: 18px;
            border-radius: 5px;
            margin-top: 20px;
        }
        .button:hover {
            background: #218838;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="https://your-logo-url.com/logo.png" alt="Your Logo" class="logo">
        <h1>Account Verified Successfully</h1>
        <p>Congratulations! Your email has been successfully verified. You can now access all the features of our platform.</p>
        <a href="{{login_link}}" class="button">Go to Dashboard</a>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p class="footer">&copy; 2025 Your Company. All rights reserved.</p>
    </div>
</body>
</html>
}
    </style>
</head>
<body>
    <div class="container">
        <img src="https://your-logo-url.com/logo.png" alt="Your Logo" class="logo">
        <h1>Account Verified Successfully</h1>
        <p>Congratulations! Your email has been successfully verified. You can now access all the features of our platform.</p>
        <a href="{{login_link}}" class="button">Go to Dashboard</a>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p class="footer">&copy; 2025 Your Company. All rights reserved.</p>
    </div>
</body>
</html>
      background: #28a745;
            color: #ffffff;
            text-decoration: none;
            font-size: 18px;
            border-radius: 5px;
            margin-top: 20px;
        }
        .button:hover {
            background: #218838;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="https://your-logo-url.com/logo.png" alt="Your Logo" class="logo">
        <h1>Account Verified Successfully</h1>
        <p>Congratulations! Your email has been successfully verified. You can now access all the features of our platform.</p>
        <a href="{{login_link}}" class="button">Go to Dashboard</a>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p class="footer">&copy; 2025 Your Company. All rights reserved.</p>
    </div>
</body>
</html>
`)

export const resetPasswordTemplate = (resetPasswordUrl: string) => (`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f7;
            margin: 0;
            padding: 0;
            text-align: center;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
        }
        p {
            color: #555;
            font-size: 16px;
            line-height: 1.6;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            font-size: 16px;
            color: #ffffff;
            background-color: #007bff;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .btn:hover {
            background-color: #0056b3;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #888;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
    </style>
</head>
<body>

<div class="container">
    <h1>Password Reset Request</h1>
    <p>Hi there,</p>
    <p>You recently requested to reset your password for your account. Click the button below to proceed:</p>
    
    <a href=${resetPasswordUrl} class="btn">Reset Password</a>

    <p>If you didn’t request this, you can safely ignore this email.</p>
    
    <p style="margin-top: 20px;">For security reasons, this link will expire in 15 minutes.</p>
    
    <p class="footer">Need help? <a href="{{SUPPORT_LINK}}">Contact Support</a></p>
</div>

</body>
</html>
`)