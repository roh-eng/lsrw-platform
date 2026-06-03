# LSRW.PRO — Skills Platform

![LSRW Platform](https://img.shields.io/badge/Status-Live-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0-blue)
![Stack](https://img.shields.io/badge/Stack-HTML5%20|%20Vanilla%20JS%20|%20Tailwind-orange)

LSRW (Listening, Speaking, Reading, Writing) is an AI-powered, dark-themed placement preparation platform designed to help candidates achieve elite communication skills. 

The platform rigorously tests and scores students across four distinct language modules, utilizing Google Gemini AI for contextual feedback and Supabase for real-time authentication and progress persistence.

Live Demo: [https://lsrw-platform.vercel.app](https://lsrw-platform.vercel.app)

---

## ✨ Key Features

- **🎧 Listening Module**: Audio comprehension with timers and play-limits.
- **🗣️ Speaking Module**: Real-time microphone dictation, open-ended speech analysis, and AI grading.
- **📖 Reading Module**: Timed comprehension tests with lockdown UI to prevent cheating.
- **✍️ Writing Module**: Passage reconstruction and essay writing with AI-driven grammatical analysis.
- **🤖 AI Chatbot Assistant**: A persistent, floating AI tutor powered by Gemini for instant feedback without breaking exam flows.
- **🏆 Gamification**: Daily streaks, profile avatars, badges, and real-time score persistence.

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), CSS3 (Tailwind primitives)
- **Backend/Auth**: Supabase (PostgreSQL, Auth, Edge Functions)
- **AI Integration**: Google Gemini 2.5 API (via secure Edge Proxy)
- **Hosting**: Vercel

---

## 🚀 Local Development Setup

If you wish to run the platform locally or contribute, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/roh-eng/lsrw-platform.git
cd lsrw-platform
```

### 2. Configure Environment Variables
The repository uses a `.gitignore` file to protect sensitive keys. You must create your own configuration file.

1. Duplicate `js/config.example.js`.
2. Rename the duplicated file to `js/config.js`.
3. Open `js/config.js` and add your Supabase URL and Anon Key. (Leave the Gemini Key blank if you are using the Edge Function).

### 3. Database Schema
If you are setting up your own Supabase project:
1. Navigate to the SQL Editor in your Supabase Dashboard.
2. Run the full contents of `data/schema.sql` to generate the `profiles`, `scores`, and `badges` tables.

### 4. Run the Dev Server
You can use the built-in Node server to run the project locally:
```bash
npm run serve
```
Open your browser to `http://localhost:5173`.

---

## 🔐 Security & Architecture

- **Static Frontend**: The frontend is a pure static bundle without a build step (for maximum simplicity). 
- **AI Edge Proxy**: To prevent exposing the Gemini API key in the browser, AI requests are routed through a Supabase Edge Function (`supabase/functions/gemini-chat`).
- **Row Level Security (RLS)**: Supabase PostgreSQL is secured via RLS policies ensuring users can only read and write their own scores and profile data.

---

## 📄 License
This project is proprietary. All rights reserved.
