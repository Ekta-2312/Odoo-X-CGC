API quick reference

Auth
- POST /api/auth/register
- POST /api/auth/verify-otp
- POST /api/auth/complete-registration
- POST /api/auth/login

Workshops
- GET /api/workshops -> list mechanics
- GET /api/workshops/:id -> mechanic details

Requests
- POST /api/requests (user) -> create service request
- GET /api/requests/me (user)
- GET /api/requests/pending (admin)
- POST /api/requests/:id/assign (admin)
- GET /api/requests/assigned (mechanic)
- POST /api/requests/:id/status (mechanic/admin)
- POST /api/requests/:id/comments (all roles)
- GET /api/requests/:id (owner/assigned/admin)
