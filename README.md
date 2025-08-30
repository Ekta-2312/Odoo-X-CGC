# Problem Statement :  RoadGuard

Develop a smart, location-aware roadside assistance platform that connects stranded vehicle owners with nearby mechanics or towing services in real time.
The platform aims to:

* Reduce response time
* Improve communication
* Enhance safety and reliability of breakdown support, especially in remote or hazardous areas.

# Challenges in Existing Roadside Assistance Process

1. Lack of Real-Time Roadside Assistance Service
2. Difficulty in Locating Nearby Mechanics
3. No Predictive AI Assistance to Suggest Service Providers
4. Lack of DIY Repair Guides for Minor Issues


# Target Users

* Vehicle Owners & Travelers: Individuals who drive personal or rental vehicles and may face unexpected breakdowns.
* Mechanics and Towing Service Providers (Workshop Owners)
* *Mechanic Employees (assigned to service requests)


# Use Case Scenarios

# 1. Submit Request (End User)

* Login → Fill service request → Submit → View in My Requests

# 2. Assign Worker (Admin)

* Login → View pending requests → Assign mechanic → Notify both

# 3. Complete Task (Worker)

* View task in calendar → Mark as Completed → Add comments

# Authentication

* Common login screen for all users
* New users must verify email OTP before logging in
* Role-based redirection post-login

# Features

# End User Features

* Workshop List Page/Homepage

  * Views: List view, card view, map view
  * Filters:

    * By distance ( <2 km, 5 km, 10 km, custom radius )
    * By status
    * Sort by Nearby & Most Rated
* Workshop Details Page

  * Show details & location added by owner
  * Share option
  * Review workshop (only after completed service)
* Service Request Form

  * Vehicle info, service type, photos, location
  * Quotation by AI or mechanic
* Track Request Status
* Map View: View mechanic/workshop location
* Request Details Page

  * Assigned mechanic, ETA, status bar
  * Live location tracking


# Admin Features

* Dashboard: New/unassigned requests, stats of completed requests
* Assignment Panel: Assign workers
* Notifications: New request alerts
* History Log: Status changes, timestamps, worker actions
* Worker Management

# Worker/Mechanic Features

* Calendar/List View: Assigned tasks
* Request Details: Vehicle info, images, customer contact
* Service Log & Comments

  * Mark stages: *Started*, *In Progress*, *Completed*



# Notification Flow

* In-app and SMS notifications
* Admin & Workers: New assignments, comments
* End Users:

  * Request submitted / accepted
  * Mechanic en route / near
  * Service completed


# Additional Features

* Request to multiple workshops at once
* Rating & Review System
* Admin Analytics Dashboard
* Downloadable Reports



# Technology Stack

* Frontend: React / TypeScript
* Backend: Node.js with Express.js
* Database: MongoDB
* Authentication: JWT, OTP Verification
* Maps Integration: Google Maps API


Team Members
1.Ekta Dodiya
2. Meet Odedra
3. Meghansh Thakker
4. Hasti Kalariya


Installation & Setup
# Clone the repository
git clone https://github.com/Ekta-2312/Odoo-X-CGC

# Navigate to project directory
cd Odoo-X-CGC

# Install dependencies
npm install

# Start the server
npm start

