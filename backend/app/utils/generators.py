"""
Shared small helpers used across routers — temp password generation
and a background-thread email dispatcher (fire-and-forget).
"""
import random
import string
import threading

def generate_temp_password(length: int = 10) -> str:
    """Generate a human-readable temporary password."""
    chars = string.ascii_letters + string.digits
    return "".join(random.choices(chars, k=length))

def send_email_async(fn, *args) -> None:
    """Run an email-sending function in a background thread so requests don't block on SMTP."""
    thread = threading.Thread(target=fn, args=args, daemon=True)
    thread.start()