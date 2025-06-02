# 🏙️ CivicSync – Citizen-Issue Reporting & Voting Platform

## 📋 Project Overview
CivicSync is a web-based platform designed to simulate a modern civic reporting system. It empowers authenticated citizens to report civic issues, browse public issues submitted by others, vote on what's important, and visualize resolution trends over time. The platform aims to provide a secure, scalable MVP that enables smooth issue lifecycle management and community participation.

## 🎯 Objective
Design and implement a fullstack application with proper authentication and authorization, enabling users to:
- Report location-specific civic issues with supporting context.
- View a real-time, paginated feed of all public issues.
- Vote once on any issue to surface priority for resolution.
- Track their personal reports and editing privileges.
- Visualize status/category-wise issue breakdowns and voting trends.
- Interact with both list-based and map-based representations of issues.

## 👥 User Role
There is a single role in this application: a citizen user. However, the actions available to a user are based on ownership and issue status.

## 🔐 Authentication & Authorization
- Users must be able to register and log in securely using email and password.
- Auth tokens or sessions should persist across refresh.
- Access to all core routes and actions must be gated by auth.
- Users can:
  - Only edit/delete their own issues.
  - Only edit/delete issues that are still in Pending state.
  - Vote only once per issue.

## 📝 Core Features

### 1. Report an Issue
Users can create a civic issue report by submitting a form with:
- **Title:** Short summary of the issue.
- **Description:** Detailed explanation.
- **Category:** Dropdown (Road, Water, Sanitation, Electricity, Other).
- **Location:** Text-based (e.g., "Sector 15, Chandigarh").
- **Image Upload:** Optional but functional.
- **Status:** Auto-set to Pending on creation.
- **Created At:** Timestamp auto-generated.

### 2. My Issues
Each user has access to a "My Issues" dashboard:
- Shows a list of their submitted issues.
- Allows editing or deleting if the issue status is still Pending.
- Displays current vote count and status.
- Clickable to open issue details.

### 3. Public Issue Feed
A globally visible, paginated list showing all reported issues:
- Each card shows:
  - Title
  - Category
  - Location
  - Status (Pending, In Progress, Resolved)
  - Vote count
  - Time since reported
- Feed supports:
  - Search by title
  - Filter by category or status
  - Sort by newest or most-voted
- Clicking a card takes the user to the full Issue Detail View with:
  - Full description
  - Uploaded image
  - Location text
  - Total votes
  - Option to cast a vote (disabled if already voted)

### 4. Voting System
- Each user can vote once on any issue (stored with userID + issueID).
- Vote count updates in real-time or on reload.
- Vote button changes state post-vote (Voted ✔).

### 5. Dashboard & Analytics View
A separate view accessible post-login, showing:
- Donut/Bar chart of issue count per category.
- Line chart showing daily issue submissions in the past 7 days.
- Bar graph or table showing most-voted issues by category.
- All visualizations should update dynamically with data.

### 6. Map View (Mandatory Feature)
- Visualize reported issues on a map view.
- Each issue is represented as a marker.
- Clicking a marker shows:
  - Title
  - Status
  - Number of votes
- Locations can be static coordinates or mocked geolocation derived from text input.

## 🧪 Additional Notes
- Status of issue (Pending, In Progress, Resolved) can be manually updated in the database or through a button (optional for candidate to simulate resolution flow).
- All images should be stored and retrievable — don't mock the upload flow.
- UI should prioritize clarity, responsiveness, and visual feedback.

## 🛠️ Technical Implementation

### 🏗️ Architecture
- **Frontend:** Built with React and TypeScript, utilizing Vite for fast development and building.
- **Backend:** Supabase is used for authentication, database management, and storage.
- **State Management:** Context API for global state management, particularly for user authentication.

### 📦 Key Technologies
- **React:** For building the user interface.
- **TypeScript:** For type safety and improved developer experience.
- **Tailwind CSS:** For styling and responsive design.
- **shadcn-ui:** For accessible and customizable UI components.
- **Supabase:** For backend services, including authentication, database, and storage.
- **React Query:** For efficient data fetching and caching.

### 📁 Directory Structure
- `src/pages/`: Contains the main application pages.
- `src/components/`: Reusable UI components.
- `src/context/`: Context providers for global state management.
- `src/lib/`: Data access and utility functions.
- `src/types/`: TypeScript type definitions.
- `src/utils/`: Utility functions for common tasks.

### 🔄 Data Flow
- **Data Fetching:** React Query is used to fetch data from Supabase, ensuring efficient caching and updates.
- **User Actions:** User actions (like voting or reporting issues) trigger updates in the database, which are reflected in the UI in real-time.

### 📊 Data Models
- **User:** Contains fields like `id`, `email`, `name`, and `createdAt`.
- **Issue:** Contains fields like `id`, `title`, `description`, `category`, `location`, `status`, `createdAt`, `userId`, `imageUrl`, `votes`, `latitude`, and `longitude`.

### 🔗 Endpoints
- **Authentication:**
  - `/auth/signup`: Register a new user.
  - `/auth/signin`: Log in an existing user.
- **Issues:**
  - `/issues`: Create a new issue.
  - `/issues/:id`: Retrieve, update, or delete a specific issue.
  - `/issues/:id/vote`: Record a vote on a specific issue.
- **User Profiles:**
  - `/users/profile`: Retrieve or update user profile information.
- **Analytics:**
  - `/analytics/trends`: Retrieve issue trends data.
  - `/analytics/top-voted`: Retrieve the most voted issues.

## 🚀 Deployment
- **Local Development:** Run `npm i` to install dependencies and `npm run dev` to start the development server.
- **Deployment:** The project can be deployed via the Lovable platform, with support for custom domains.

## 📝 Conclusion
CivicSync is a robust platform that empowers communities to engage with local issues effectively. Its modern architecture and user-friendly design make it a valuable tool for civic engagement.

---

Feel free to explore the codebase and contribute to its development! If you have any questions or need further assistance, don't hesitate to reach out.



hellooooo