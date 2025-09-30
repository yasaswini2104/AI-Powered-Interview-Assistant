# AI-Powered Interview Assistant

An intelligent, full-stack application designed to automate the initial technical screening process for software development roles. This tool provides a seamless, **timed, AI-driven interview experience** for candidates and delivers **powerful, actionable insights** to recruiters.


---

## Core Features

### For the Candidate (Interviewee)

* **Clean Chat Interface**: Simulates a real-world technical screening.
* **Dynamic Role Selection**: Choose from predefined roles (Full Stack, Frontend, etc.) or specify a custom role for tailored questions.
* **Automated Resume Parsing**: Extracts details (name, email, phone) from uploaded PDF resumes.
* **Guided Info Completion**: Friendly form prompts for missing details.
* **Timed AI Interview Flow**:

  * 6 structured questions: **2 Easy → 2 Medium → 2 Hard**
  * Strict timers: **20s, 60s, 120s**
  * Progress auto-saved → Resume exactly where you left off with "Welcome Back" modal.

### For the Recruiter (Interviewer)

* **Centralized Candidate Dashboard**: Searchable, sortable table with candidate results.
* **Advanced AI Analysis**:

  * Concise performance summary
  * Strengths & weaknesses
  * Hiring Recommendation: *(Strong Hire, Hire, Leaning Hire, Leaning No Hire, No Hire)* with justification
* **Actionable Tools**:

  * Download PDF Report (full interview transcript + AI analysis)
  * One-click "Email Candidate"

---

## Architectural Highlights

* **Hybrid Persistence Model**

  * *Frontend*: Redux Persist → Saves sessions locally (refresh-proof).
  * *Backend*: MongoDB Atlas → Permanent storage for all interviews.
* **Resilient Backend Logic**

  * Backend is the **single source of truth**.
  * Eliminates bugs by validating against database records instead of trusting client data.

---

## 🛠️ Tech Stack

| Area            | Technologies                                                                          |
| --------------- | ------------------------------------------------------------------------------------- |
| **Frontend**    | React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Redux Toolkit, Redux Persist, Axios |
| **Backend**     | Node.js, Express.js                                                                   |
| **Database**    | MongoDB Atlas, Mongoose                                                               |
| **AI Services** | Google Gemini API (question generation & evaluation)                                  |
| **Utilities**   | jspdf, html2canvas (PDF generation), pdf2json (resume parsing)                        |

---

## 🚀 Local Development Setup

### 🔧 Prerequisites

* Node.js (v18 or later)
* MongoDB Atlas account (free tier works)
* Google AI API Key (from Google AI Studio)

---

### ⚙️ Backend Setup

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
   Create `.env` inside `server` with:

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

   The backend runs at: **[http://localhost:8000](http://localhost:8000)**

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

3. **Start the Client**

   ```bash
   npm run dev
   ```

   The frontend runs at: **[http://localhost:5173](http://localhost:5173)** (default Vite port)


👉 Do you want me to **include screenshots/demo GIFs section** in this README (placeholders), so it looks even more professional on GitHub?
