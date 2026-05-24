# Fityness

Fityness is a modern fitness platform focused on helping users organize workouts, stay consistent, and track real progress through a clean and intelligent experience.

The application combines workout management, scheduling, analytics, and AI-powered features into a single platform designed for people who take training seriously.

---

## Overview

Fityness was built to solve a common problem with fitness apps: most are either too simple or unnecessarily complicated.

The goal of the project is to provide a modern experience where users can:

- Create and organize workouts
- Schedule training sessions
- Track workout performance in real time
- Visualize long-term progress
- Stay consistent with streaks and analytics
- Use AI-powered features to improve productivity

The application focuses heavily on performance, responsiveness, and smooth UX across desktop and mobile devices.

---

## Main Features

### Workout Management

Users can create fully personalized workout routines with:

- Exercises
- Sets
- Repetitions
- Rest time
- Categories

Workouts are grouped by categories like Push, Pull, Upper Body, Lower Body, and Full Body, making organization easier.

The interface was designed to feel fast and responsive through optimistic UI updates, where changes appear instantly before syncing with the backend.

---

### Calendar & Scheduling

Fityness includes a complete workout scheduling system.

Users can:

- Schedule one-time workouts
- Create recurring workout routines
- Manage weekly training plans
- Visualize workouts inside a calendar

Instead of storing every recurring workout occurrence in the database, the application stores recurrence rules and generates occurrences dynamically on the frontend using the `rrule` library.

This approach keeps the database lightweight, scalable, and efficient.

---

### Workout Session Tracking

During a workout session, users can:

- Track weight and reps per set
- Mark completed sets
- Monitor workout duration
- View previous performance history

After finishing a workout, all session data is saved into workout history for future analysis.

This allows users to compare performance over time and progressively overload exercises more naturally.

---

### Progress Analytics

The analytics system transforms workout history into meaningful metrics, including:

- Total training volume
- Strength progression
- Consistency tracking
- Personal records
- Monthly statistics
- Muscle distribution

Charts and visual indicators are built using Recharts to provide a modern dashboard experience.

---

### Streak System

Fityness includes a consistency-based streak system that calculates consecutive training days from workout history.

The streak logic is based on real completed sessions rather than manually stored counters, which makes the system more reliable and resistant to inconsistencies.

---

### Authentication & Security

Authentication is handled through Firebase Authentication.

Firestore Security Rules ensure users can only access and modify their own data.

The application also uses batch operations for safer database updates and deletions.

---

## Technical Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Backend | Firebase |
| Database | Firestore |
| Forms & Validation | React Hook Form + Zod |
| Routing | React Router |
| Charts | Recharts |
| Scheduling | rrule |

---

### Optimistic UI

Most user actions update the UI immediately before backend synchronization.

This creates a faster and smoother experience, especially on slower connections.

---

### History as Source of Truth

Metrics like streaks and progress are calculated directly from workout history instead of relying on stored counters.

This helps maintain consistency and prevents data drift.

---

### Context Separation

Authentication, profile data, and UI state are separated into different React contexts to improve maintainability and reduce unnecessary re-renders.

---

## Live Demo

Fityness is currently available online:

https://fityness.vercel.app

Explore the platform, manage workouts, schedule training sessions, and track your progress in real time.

---

## Author

Created and designed by Otavio Lima.

---

## License

Copyright © 2026 Otávio Lima. All rights reserved.

This project is public for portfolio and educational purposes only.
Unauthorized use, copying, modification, or distribution is prohibited.