# AI-Powered Interview Assistant

An intelligent, full-stack platform designed to automate the initial technical screening process for software development roles.
This assistant provides a seamless, timed, AI-driven interview experience for candidates and delivers insightful analytics for recruiters — helping teams make faster, data-driven hiring decisions.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Features](#core-features)
3. [Trial Mode](#trial-mode)
4. [Architecture](#architecture)
5. [Tech Stack](#tech-stack)
6. [Setup Instructions](#setup-instructions)
7. [Trial vs Authenticated Mode](#trial-vs-authenticated-mode)
8. [Testing Scenarios](#testing-scenarios)
9. [Why This Architecture Works](#why-this-architecture-works)
<!-- 10. [Contributors](#contributors)
11. [License](#license) -->

---

## Overview

**AI-Powered Interview Assistant** is a full-stack web application that automates the early-stage technical screening process for software development roles.
It uses **Google Gemini AI** to generate and evaluate interview questions in real time, creating an interactive, timed, and structured experience for candidates.

Recruiters receive AI-based insights, performance summaries, and detailed reports, all in one centralized dashboard.

---

## Core Features

### For Candidates

* **Interactive Chat Interface**
  Simulates a real-time technical interview with natural AI conversation.

* **Dynamic Role Selection**
  Choose from predefined roles (Full Stack, Frontend, etc.) or specify a custom one for AI-generated questions.

* **Resume Parsing**
  Automatically extracts candidate details (name, email, phone) from PDF resumes.

* **Guided Info Completion**
  Prompts users to fill in missing details before starting the interview.

* **Timed AI Interview Flow**

  * 6 AI-generated questions: 2 Easy → 2 Medium → 2 Hard
  * Time limits: 20s, 60s, and 120s respectively
  * Auto-saved progress with a **"Welcome Back"** modal

---

### For Recruiters

* **Candidate Dashboard**
  Displays all completed interviews in a searchable, sortable table.

* **AI-Powered Analysis**

  * Summary of candidate performance
  * Strengths and weaknesses
  * Hiring Recommendation:
    *Strong Hire, Hire, Leaning Hire, Leaning No Hire, No Hire* (with justification)

* **Actionable Tools**

  * Download full interview transcript as a **PDF Report**
  * One-click **Email Candidate** button

---

## Trial Mode

The app includes a **Trial Mode**, allowing users to explore the full experience without logging in.

### Features

* Access **Interviewee (Chat)** and **Interviewer (Dashboard)** tabs directly
* Conduct a **complete AI-driven interview** without authentication
* Data is persisted locally using **Redux Persist**
* Simulated resume parsing with manual info collection
* Local dashboard to view all completed trial interviews

> Trial Mode stores data in the browser only. No backend sync is performed.

---

## Authenticated Experience

### Individual User Mode

* Similar UI to Trial Mode
* Data is synced to **MongoDB Atlas**
* Resume parsing occurs on the **server**
* Dashboard shows all interviews across devices

### Recruiter Mode

* Additional **Create Session** tab
* Can generate **public interview links** for candidates
* Recruiter dashboard displays all linked candidate results

---

## Architecture

### Hybrid Persistence Model

| Layer    | Technology    | Description                     |
| -------- | ------------- | ------------------------------- |
| Frontend | Redux Persist | Stores trial sessions locally   |
| Backend  | MongoDB Atlas | Manages authenticated user data |

### Backend as Single Source of Truth

The backend validates all interview progress and data integrity, ensuring consistency across sessions and devices.

---

## Tech Stack

| Area       | Technologies                                                                          |
| ---------- | ------------------------------------------------------------------------------------- |
| Frontend   | React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Redux Toolkit, Redux Persist, Axios |
| Backend    | Node.js, Express.js                                                                   |
| Database   | MongoDB Atlas, Mongoose                                                               |
| AI Service | Google Gemini API (for question generation & evaluation)                              |
| Utilities  | jspdf, html2canvas (PDF generation), pdf2json (resume parsing)                        |

---

## Setup Instructions

### Prerequisites

Ensure you have the following installed:

* Node.js (v18 or later)
* MongoDB Atlas account (free tier)
* Google AI API key (from [Google AI Studio](https://aistudio.google.com))

---

### Backend Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yasaswini2104/AI-Powered-Interview-Assistant.git
   cd AI-Powered-Interview-Assistant
   ```

2. **Navigate to the Server Directory**

   ```bash
   cd server
   ```

3. **Create Environment File**
   Add a `.env` file inside `server`:

   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   GOOGLE_API_KEY=your_google_ai_api_key
   ```

4. **Install Dependencies**

   ```bash
   npm install
   ```

5. **Start the Server**

   ```bash
   npm run dev
   ```

   Backend runs at: [http://localhost:8000](http://localhost:8000)

---

### Frontend Setup

1. **Navigate to Client Directory**

   ```bash
   cd client
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Start the Frontend**

   ```bash
   npm run dev
   ```

   Frontend runs at: [http://localhost:5173](http://localhost:5173)

---

## Trial vs Authenticated Mode

| Feature            | Trial Mode   | Authenticated User | Recruiter         |
| ------------------ | ------------ | ------------------ | ----------------- |
| Login Required     | No           | Yes                | Yes               |
| Data Storage       | LocalStorage | MongoDB Atlas      | MongoDB Atlas     |
| Resume Parsing     | Manual       | Automated          | Automated         |
| Dashboard          | Local        | Cloud Synced       | Candidate Reports |
| Create Public Link | No           | No                 | Yes               |
| Device Sync        | No           | Yes                | Yes               |

---

## Testing Scenarios

| Scenario                               | Expected Result                           |
| -------------------------------------- | ----------------------------------------- |
| Take interview in trial mode           | Appears locally and persists on refresh   |
| Sign up as a new user                  | Trial data is cleared, server data starts |
| Recruiter creates a session link       | Generates unique public URL               |
| Candidate completes interview via link | Recruiter sees result in dashboard        |
| Logout and revisit                     | Trial data remains locally (optional)     |

---

## Why This Architecture Works

* Local-first design ensures fast trial onboarding
* Backend-first logic guarantees secure, verified data
* JWT tokens provide authenticated access and isolation
* Redux Persist ensures reliable client-side storage
* Automatic resume handling and progress restoration

