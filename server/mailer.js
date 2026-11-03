const nodemailer = require('nodemailer');
const path = require('path');

const logoPath = path.join(__dirname, '..', 'assets', 'img', 'logo,.png');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_SECURE).toLowerCase() === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  return transporter;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDetails(data) {
  return Object.entries(data)
    .map(([label, value]) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #e8eee9;color:#708076;font-size:11px;font-weight:bold;letter-spacing:.7px;text-transform:uppercase;width:34%;vertical-align:top;">${escapeHtml(label)}</td>
        <td style="padding:14px 0;border-bottom:1px solid #e8eee9;color:#26352c;font-size:15px;line-height:1.55;vertical-align:top;">${escapeHtml(value)}</td>
      </tr>`)
    .join('');
}

function getNotificationCopy(type) {
  const copy = {
    'contact message': {
      category: 'Contact message'
    },
    'volunteer signup': {
      category: 'Volunteer application'
    },
    donation: {
      category: 'Donation'
    }
  };

  return copy[type] || { category: 'Website message' };
}

async function sendSubmissionNotification(type, data) {
  const recipients = (process.env.NOTIFICATION_EMAIL || '')
    .split(',')
    .map(email => email.trim())
    .filter(Boolean);
  const mailTransporter = getTransporter();

  if (!recipients.length || !mailTransporter) {
    console.warn('Email notifications are disabled. Configure SMTP_* and NOTIFICATION_EMAIL in .env.');
    return false;
  }

  const notificationCopy = getNotificationCopy(type);
  const subject = `Baobab website update | ${notificationCopy.category}`;
  const receivedAt = new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());
  const text = Object.entries(data)
    .map(([label, value]) => `${label}\n${value ?? ''}`)
    .join('\n\n') +
    `\n\nReceived ${receivedAt}\nBaobab Networking Centre\ninfo@baobabnetworking.org\nCopyright ${new Date().getFullYear()} Baobab Networking Centre.`;

  const year = new Date().getFullYear();

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>${escapeHtml(subject)}</title>
      </head>
      <body style="margin:0;padding:0;background:#e8f0eb;font-family:Arial,sans-serif;color:#26352c;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">A new update has come in through the Baobab website.</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#e8f0eb;">
          <tr>
            <td align="center" style="padding:34px 12px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:620px;background:#ffffff;border:1px solid #d5e2d9;border-radius:16px;overflow:hidden;box-shadow:0 12px 30px rgba(36,91,70,.08);">
                <tr><td style="height:5px;background:#e2a84a;font-size:0;line-height:0;">&nbsp;</td></tr>
                <tr>
                  <td align="center" style="padding:18px 24px;background:#ffffff;">
                    <img src="cid:baobab-logo" width="170" alt="Baobab Networking Centre" style="display:block;width:170px;max-width:100%;height:auto;margin:0 auto;border:0;">
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 32px 26px;background:#245b46;color:#ffffff;">
                    <div style="font-size:12px;letter-spacing:2.5px;text-transform:uppercase;color:#cfe4d5;font-weight:bold;">Baobab / Website</div>
                    <div style="margin-top:22px;color:#e2a84a;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;font-weight:bold;">${escapeHtml(notificationCopy.category)}</div>
                    <h1 style="margin:8px 0 10px;font-size:28px;line-height:1.2;font-weight:600;">A new update has come in</h1>
                    <p style="margin:0;color:#e3f0e5;font-size:15px;line-height:1.55;">Here is what someone sent through the Baobab website.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 32px;background:#ffffff;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-bottom:1px solid #e8eee9;">
                      <tr>
                        <td style="padding:16px 0;color:#708076;font-size:12px;letter-spacing:.6px;text-transform:uppercase;">Received</td>
                        <td align="right" style="padding:16px 0;color:#26352c;font-size:13px;font-weight:bold;">${escapeHtml(receivedAt)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 32px 30px;">
                    <div style="margin-bottom:16px;color:#607067;font-size:12px;letter-spacing:1px;text-transform:uppercase;font-weight:bold;">Message details</div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">${formatDetails(data)}</table>
                    <div style="margin-top:25px;padding:16px 17px;background:#f3f7f3;border-left:3px solid #e2a84a;color:#53645a;font-size:14px;line-height:1.55;">A quick reply is the easiest way to follow up with them.</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:23px 30px;background:#f7faf7;border-top:1px solid #e5eee7;text-align:center;">
                    <div style="color:#245b46;font-size:15px;font-weight:bold;">Baobab Networking Centre</div>
                    <div style="margin-top:7px;color:#607067;font-size:13px;line-height:1.6;">info@baobabnetworking.org</div>
                    <div style="margin-top:14px;color:#8a978e;font-size:12px;line-height:1.55;">A simple update from your Baobab website.<br>Copyright ${year} Baobab Networking Centre.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;

  await mailTransporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: recipients,
    replyTo: data.Email || process.env.SMTP_USER,
    subject,
    text,
    html,
    attachments: [
      {
        filename: 'baobab-logo.png',
        path: logoPath,
        cid: 'baobab-logo'
      }
    ]
  });

  console.log(`Email notification sent for ${type}.`);
  return true;
}

async function notifySubmission(type, data) {
  try {
    await sendSubmissionNotification(type, data);
  } catch (error) {
    console.error(`Email notification failed for ${type}:`, error.message);
  }
}

module.exports = { notifySubmission };
