# Test account credentials (after `npm run seed:therapists`)

Run from `theraphy-backend` with `DATABASE_URL` or `NEON_DATABASE_URL` set in `.env`:

```bash
npm run seed:therapists
```

## Therapists (verified — can log in immediately)

| Email | Password |
|-------|----------|
| `henok@theraphy.com` | `Therapist@123` |
| `nardos@theraphy.com` | `Therapist@123` |
| `hilina@theraphy.com` | `Therapist@123` |
| `therapist.dr.sarah@theraphy.com` | `Therapist@123` (only if that user already exists) |

## Admin

| Email | Password |
|-------|----------|
| `admin@theraphy.com` | `Admin@123` |

The script is idempotent: re-running updates passwords and sets therapists to **verified**.
