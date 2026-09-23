# Production Backend Checklist

The included browser demo is intentionally easy to review. To take real students or real payouts, replace localStorage with a secure backend.

## Recommended roles
- Super Admin: full platform, finance, settings and audit access
- Admin: students, classes, programs, approved earnings, withdrawals
- Trainer: assigned classes/courses only
- Student: own profile/classes/performance/balance/history only

## Student-facing finance model
The student API should expose only:
- approved earnings history
- available balance
- total paid
- withdrawal history

Internal partner/source accounting must live in admin-only fields/endpoints.

## Critical security
- Password hashing (Argon2id/bcrypt)
- Email/phone verification
- Admin 2FA
- Row-level authorization checks on every request
- CSRF/session protection
- Encryption for payout-account values
- Immutable audit logs for earning/balance edits
- Rate limiting and suspicious-login alerts
- Daily backups
- Separate production/staging environments

## Payout flow
1. Admin imports/adds an approved student credit.
2. DB transaction increases approved lifetime earnings and available balance.
3. Student receives notification.
4. Student submits withdrawal to JazzCash/Easypaisa/SadaPay/NayaPay/Bank.
5. DB transaction reserves the requested amount.
6. Admin sends payment outside the app or through an approved provider/API.
7. Admin records payment reference and marks Paid.
8. Total Paid increases and student receives notification.
9. Rejected/failed requests restore reserved amount when appropriate.

## Live classes
Start with Zoom or Google Meet links. Later integrate Zoom API or LiveKit for automated sessions, attendance and recordings.

## Notifications
Phase 1: in-app + email.
Phase 2: Web Push.
Phase 3: WhatsApp Business API templates for approved account notifications.

## Legal
Have a qualified lawyer review final Terms, Privacy, Refund, Earnings and Payout policies before launch, especially if the platform receives third-party creator funds or applies any fees/adjustments.
