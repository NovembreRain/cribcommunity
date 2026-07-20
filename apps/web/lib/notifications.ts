import sgMail from '@sendgrid/mail'

interface BookingAlertInput {
  bookingId: string
  guestName: string
  guestEmail: string
  guestPhone?: string | null
  propertyName: string
  roomTypeName: string
  checkInDate: string
  checkOutDate: string
  totalAmount: number
}

/**
 * Emails a new-booking alert to the ops inbox. Never throws — a failed
 * notification must not fail the booking itself. Silently no-ops if
 * SendGrid isn't configured (e.g. local dev without the env vars set).
 */
export async function sendBookingAlertEmail(booking: BookingAlertInput): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY
  const fromEmail = process.env.SENDGRID_FROM_EMAIL
  const toEmail = process.env.BOOKING_ALERT_EMAIL ?? 'cribcommunity@gmail.com'

  if (!apiKey || !fromEmail) {
    console.warn('SendGrid not configured (SENDGRID_API_KEY / SENDGRID_FROM_EMAIL) — skipping booking alert email.')
    return
  }

  sgMail.setApiKey(apiKey)

  const subject = `New booking: ${booking.guestName} — ${booking.propertyName}`
  const text = [
    `New booking received.`,
    ``,
    `Guest: ${booking.guestName}`,
    `Email: ${booking.guestEmail}`,
    booking.guestPhone ? `Phone: ${booking.guestPhone}` : null,
    `Property: ${booking.propertyName}`,
    `Room: ${booking.roomTypeName}`,
    `Check-in: ${booking.checkInDate}`,
    `Check-out: ${booking.checkOutDate}`,
    `Total: ₹${booking.totalAmount.toLocaleString('en-IN')}`,
    `Booking ID: ${booking.bookingId}`,
  ].filter(Boolean).join('\n')

  try {
    await sgMail.send({ to: toEmail, from: fromEmail, subject, text })
  } catch (err) {
    console.error('Failed to send booking alert email:', err)
  }
}
