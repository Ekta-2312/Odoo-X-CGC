# RoadGuard — Smart Roadside Assistance

RoadGuard connects stranded drivers to nearby, verified mechanics in real time with live tracking, role‑based portals, and instant notifications.

## Monorepo layout

- Odoo/
  - project/
    - backend/ — Node.js + Express + MongoDB API (JWT, OTP, Socket.IO)
    - frontend/ — React + TypeScript + Vite UI (Tailwind, sockets, Leaflet)

## Features

- User
  - Browse verified mechanics; filter/sort; list/grid/map views
  - Create a service request with vehicle + location
  - Track status live (submitted → assigned → in‑progress → completed)
  - Request History page with CSV export
- Admin
  - See dashboard and all/pending requests
  - Assign mechanics; delete single/bulk requests
  - Workers tab to verify/unverify mechanics
- Mechanic
  - See assigned requests; update status; basic map

## Quick start (Windows PowerShell)

1) Backend
- cd Odoo\project\backend
- Copy .env.example to .env and set:
  - MONGO_URI=mongodb://localhost:27017/roadguard
  - JWT_SECRET=change_me
  - PORT=5000
- npm install
- node server.js

2) Frontend
- cd Odoo\project\frontend
- npm install
- npm run dev
- Open http://localhost:5173

Login flow: open /dashboard?token=<jwt>&role=<user|mechanic|admin> to store token and redirect.

## API highlights

- Auth: /api/auth/* (OTP, register, login)
- Workshops:
  - GET /api/workshops — verified mechanics (public)
  - GET /api/workshops/admin/all — all mechanics (admin)
  - PATCH /api/workshops/admin/:id/verify — toggle verified
- Requests:
  - POST /api/requests — create (user)
  - GET /api/requests/me — my requests (user)
  - GET /api/requests/pending|all — admin listings
  - POST /api/requests/:id/assign — admin assign
  - DELETE /api/requests/:id — admin delete
  - POST /api/requests/bulk-delete — admin bulk delete
  - GET /api/requests/assigned — mechanic tasks
  - POST /api/requests/:id/status — update status
  - GET /api/requests/:id — details for owner/assigned/admin

## Realtime events

Socket.IO (http://localhost:5000)
- request:new — new request created
- request:updated — status or assignment changed
- request:deleted, request:deleted_many — deletions

## Request History CSV logic

- Exports the currently filtered list (or all if the filter is empty)
- Fields: ID, Service, Status, Mechanic, Estimated Cost, ETA (min), Created At, Address
- Escapes commas/quotes/newlines; preprends UTF‑8 BOM for Excel
- Triggers a Blob download like: roadguard-requests-<filter>-YYYY-MM-DD-HH-MM-SS.csv

## Dev tips

- If PORT 5000 is in use: Get-NetTCPConnection -LocalPort 5000 | Select -First 1 -Expand OwningProcess; Stop-Process -Id <PID> -Force
- Ensure accessToken in localStorage for admin‑only calls

## Team
Ekta Dodiya • Meet Odedra • Meghansh Thakker • Hasti Kalariya

## Video Link
https://drive.google.com/file/d/1Xg1K9SQN4pJppVyPSwKYRWfK_PEGqUG1/view?usp=drive_link