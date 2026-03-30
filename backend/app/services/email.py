import logging
from aiosmtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.config import get_settings

logger = logging.getLogger(__name__)


async def send_verification_email(
    to_email: str,
    poll_id: str,
    verification_code: str,
) -> bool:
    settings = get_settings()
    if not settings.email_enabled:
        logger.info("Email disabled. Would have sent verification to %s", to_email)
        return False

    base_url = settings.base_url.rstrip("/")
    verify_url = f"{base_url}/verify?token={verification_code}"

    subject = "Verify your vote"
    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">Confirm your vote</h1>
      <p>Click the button below to verify your email address and confirm your vote.</p>
      <p>
        <a href="{verify_url}" style="background:#4f46e5;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">
          Verify my vote
        </a>
      </p>
      <p style="color:#888;font-size:12px;">If you didn't vote in this poll, you can ignore this email.</p>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.smtp_from
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))

    try:
        async with SMTP(hostname=settings.smtp_host, port=settings.smtp_port) as smtp:
            if settings.smtp_tls:
                await smtp.starttls()
            if settings.smtp_user and settings.smtp_password:
                await smtp.login(settings.smtp_user, settings.smtp_password)
            await smtp.send_message(msg)
        logger.info("Sent verification email to %s for poll %s", to_email, poll_id)
        return True
    except Exception as e:
        logger.error("Failed to send verification email to %s: %s", to_email, e)
        return False


async def send_poll_results_email(
    to_email: str,
    poll_title: str,
    poll_id: str,
    winner: str | None,
) -> bool:
    settings = get_settings()
    if not settings.email_enabled:
        logger.info("Email disabled. Would have sent results to %s", to_email)
        return False

    base_url = settings.base_url.rstrip("/")
    results_url = f"{base_url}/poll/{poll_id}"

    subject = f"Results are in: {poll_title}"
    winner_block = (
        f'<div style="background:#f3f0ff;border-left:4px solid #7c3aed;padding:12px 16px;border-radius:4px;margin:16px 0;">'
        f'<span style="font-size:13px;color:#6d28d9;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Winner</span>'
        f'<p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#1a1a1a;">{winner}</p>'
        f'</div>'
        if winner else
        '<p style="color:#555;">No clear winner was determined.</p>'
    )

    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <h1 style="font-size:22px;margin-bottom:4px;">Poll closed: {poll_title}</h1>
      <p style="color:#555;margin-top:0;">The results are in — here's how it turned out.</p>
      {winner_block}
      <p style="margin-top:24px;">
        <a href="{results_url}" style="background:#7c3aed;color:white;padding:10px 22px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block;">
          View Full Results
        </a>
      </p>
      <hr style="border:none;border-top:1px solid #eee;margin:28px 0 16px;">
      <p style="color:#aaa;font-size:12px;">
        You received this because you voted in this poll.
      </p>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.smtp_from
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))

    try:
        async with SMTP(hostname=settings.smtp_host, port=settings.smtp_port) as smtp:
            if settings.smtp_tls:
                await smtp.starttls()
            if settings.smtp_user and settings.smtp_password:
                await smtp.login(settings.smtp_user, settings.smtp_password)
            await smtp.send_message(msg)
        logger.info("Sent results email to %s for poll %s", to_email, poll_id)
        return True
    except Exception as e:
        logger.error("Failed to send email to %s: %s", to_email, e)
        return False
