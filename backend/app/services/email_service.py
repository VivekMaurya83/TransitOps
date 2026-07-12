"""
Professional SMTP email service with branded HTML templates.
Supports: Welcome (admin), User Invite, and Password Reset emails.
"""
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from ..config import settings

SMTP_HOST = settings.SMTP_HOST
SMTP_PORT = settings.SMTP_PORT
EMAIL_ID = settings.EMAIL_ID
EMAIL_PASS = settings.EMAIL_PASS
FRONTEND_URL = settings.FRONTEND_URL

# ─── Brand style constants ────────────────────────────────────────────────
PRIMARY_COLOR = "#01696F"   # TransitOps teal accent, replacing Stratega purple
PRIMARY_DARK = "#0C4E54"
BG_COLOR = "#F7F6F2"
CARD_BG = "#FFFFFF"
TEXT_DARK = "#1C1B1F"
TEXT_MUTED = "#49454F"
FONT_STACK = "'Segoe UI', 'Inter', Arial, sans-serif"
BRAND_NAME = "TransitOps"

def _send_email(to_email: str, subject: str, html_body: str) -> None:
    """Core SMTP sender — raises on failure so callers can handle it."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{BRAND_NAME} <{EMAIL_ID}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(EMAIL_ID, EMAIL_PASS)
        server.sendmail(EMAIL_ID, to_email, msg.as_string())

def _base_layout(content_html: str) -> str:
    """Wraps any email content with the branded TransitOps header + footer."""
    return f"""
    <html>
      <body style="margin:0;padding:0;background:{BG_COLOR};font-family:{FONT_STACK};">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
          <tr>
            <td align="center">
              <table width="480" cellpadding="0" cellspacing="0"
                     style="background:{CARD_BG};border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="background:{PRIMARY_COLOR};padding:24px 32px;">
                    <span style="color:#fff;font-size:20px;font-weight:700;">{BRAND_NAME}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;color:{TEXT_DARK};font-size:15px;line-height:1.6;">
                    {content_html}
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 32px;color:{TEXT_MUTED};font-size:12px;background:{BG_COLOR};">
                    © {BRAND_NAME} — Smart Transport Operations Platform
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """

def send_welcome_email(to_email: str, admin_name: str, company_name: str) -> None:
    """Sent when an admin registers a new company workspace."""
    content = f"""
    <h2 style="color:{PRIMARY_DARK};">Welcome to {BRAND_NAME}, {admin_name}! 🚚</h2>
    <p>Your <strong>{company_name}</strong> fleet operations workspace has been created
       successfully. You now have full admin access to manage vehicles, drivers, trips,
       maintenance, fuel logs, and analytics.</p>
    <p style="margin-top:20px;">
      1. Register your vehicles and drivers<br>
      2. Dispatch your first trip<br>
      3. Monitor fleet utilization on the Dashboard
    </p>
    <p style="margin-top:24px;color:{TEXT_MUTED};">Need help? Reply to this email anytime.</p>
    """
    html = _base_layout(content)
    _send_email(to_email, f"Welcome to {BRAND_NAME}, {admin_name}! 🚚", html)

def send_invite_email(
    to_email: str, invitee_name: str, admin_name: str,
    company_name: str, temp_password: str,
) -> None:
    """Sent to a newly invited user with their temporary password."""
    login_url = f"{FRONTEND_URL}/login"
    content = f"""
    <h2 style="color:{PRIMARY_DARK};">You've been invited to {company_name}</h2>
    <p><strong>{admin_name}</strong> has invited you to join the <strong>{company_name}</strong>
       fleet workspace on {BRAND_NAME}. Use the temporary credentials below to sign in.</p>
    <p><strong>Email:</strong> {to_email}<br><strong>Temporary Password:</strong> {temp_password}</p>
    <p style="color:#a12c7b;"><strong>⚠️ Important:</strong> You will be asked to set a new
       password immediately after your first login.</p>
    <p style="margin-top:24px;">
      <a href="{login_url}" style="background:{PRIMARY_COLOR};color:#fff;padding:10px 20px;
         border-radius:6px;text-decoration:none;">Log in to {BRAND_NAME}</a>
    </p>
    """
    html = _base_layout(content)
    _send_email(to_email, f"You've been invited to {company_name} on {BRAND_NAME}", html)

def send_password_reset_email(to_email: str, user_name: str, temp_password: str) -> None:
    """Sent when a user requests a password reset."""
    content = f"""
    <h2 style="color:{PRIMARY_DARK};">Password Reset Requested</h2>
    <p>Hi <strong>{user_name}</strong>, we received a request to reset your {BRAND_NAME}
       password. Use the temporary password below to log in.</p>
    <p><strong>Temporary Password:</strong> {temp_password}</p>
    <p style="color:#a12c7b;"><strong>⚠️ Security Notice:</strong> Change this password
       immediately after logging in. This temporary password is valid for 24 hours.</p>
    """
    html = _base_layout(content)
    _send_email(to_email, f"Reset your {BRAND_NAME} password", html)