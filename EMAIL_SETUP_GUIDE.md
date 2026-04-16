# Email Configuration Guide

## Current Status

✅ **Development Mode**: Email service is disabled by default to prevent authentication errors  
⚠️ **Production**: Requires proper email configuration

## Development Mode (Current Setup)

The application is configured to work without email in development:

- Email sending is simulated and logged to console
- User registration works without email verification
- No email credentials required for local development

## Production Email Setup

### Option 1: Gmail SMTP (Recommended for small scale)

1. **Create Gmail App Password**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification (enable if not already)
   - Security → App passwords
   - Generate app password for "Mail"

2. **Update Backend/.env**:
   ```env
   EMAIL_USERNAME=your-gmail@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password
   ```

### Option 2: Professional Email Service (Recommended for production)

#### SendGrid

```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
```

#### Mailgun

```env
EMAIL_SERVICE=mailgun
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain
EMAIL_FROM=noreply@yourdomain.com
```

#### AWS SES

```env
EMAIL_SERVICE=ses
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
EMAIL_FROM=noreply@yourdomain.com
```

### Option 3: Custom SMTP Server

```env
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_USERNAME=noreply@yourdomain.com
EMAIL_PASSWORD=your-smtp-password
EMAIL_SECURE=false
```

## Testing Email Configuration

### 1. Test Email Sending

```bash
cd Backend
node -e "
const { sendEmail } = require('./utils/email.js');
sendEmail({
  email: 'test@example.com',
  template: 'verification',
  name: 'Test User',
  verifyUrl: 'http://localhost:5173/verify?token=test'
}).then(() => console.log('Email test successful'))
.catch(err => console.error('Email test failed:', err));
"
```

### 2. Check Email Logs

- Development: Check console output for email simulation logs
- Production: Check application logs for email delivery status

## Email Templates Available

1. **verification**: Email verification for new users
2. **password-reset**: Password reset emails
3. **project-approved**: Project approval notifications
4. **project-rejected**: Project rejection notifications

## Troubleshooting

### Gmail Authentication Issues

- Ensure 2-factor authentication is enabled
- Use App Password, not regular password
- Check "Less secure app access" is disabled (use App Password instead)

### SMTP Connection Issues

- Verify SMTP server settings
- Check firewall/network restrictions
- Test with telnet: `telnet smtp.gmail.com 587`

### Development Mode Issues

- Email simulation logs appear in console
- No actual emails are sent
- Registration still works without email verification

## Security Best Practices

1. **Never commit email credentials to version control**
2. **Use environment variables for all email settings**
3. **Use App Passwords for Gmail, not regular passwords**
4. **Consider using professional email services for production**
5. **Implement rate limiting for email sending**
6. **Monitor email delivery rates and bounces**

## Current Implementation Features

✅ **Template-based emails** with professional styling  
✅ **Development mode** with email simulation  
✅ **Error handling** that doesn't break user registration  
✅ **Bulk email support** with rate limiting  
✅ **HTML and text versions** of all emails  
✅ **Configurable email providers**

## Next Steps for Production

1. Choose an email service provider
2. Configure credentials in production environment
3. Test email delivery
4. Set up email monitoring and analytics
5. Configure email templates for your domain
