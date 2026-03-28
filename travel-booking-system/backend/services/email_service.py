def send_booking_confirmation(email: str, reference: str) -> dict:
    return {
        "status": "queued",
        "message": f"Confirmation email queued for {email}",
        "reference": reference,
    }
