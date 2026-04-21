# JobMatch AI 🎯

> Match your resume to any job listing and get an AI-tailored version in seconds.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-F55036?style=flat)
![JSearch](https://img.shields.io/badge/JSearch-RapidAPI-blue?style=flat)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat&logo=vercel)

---

## What it does

JobMatch AI is a full-stack AI-powered web app that helps job seekers apply smarter. Upload your resume, find a job listing, and get:

- **Match score** — how well your resume fits the role (0–100%)
- **Keyword gap analysis** — what's missing vs what's matched, highlighted directly in your resume
- **AI-tailored resume** — rewritten bullets using the JD's language and keywords
- **Cover letter** — auto-generated and editable
- **Interview prep** — 8 likely questions with suggested answers based on your resume
- **Job tracker** — track application status across multiple roles

---

## Demo

![JobMatch AI Demo](./demo.gif)

> *Add a demo GIF using [LICEcap](https://www.cockos.com/licecap/) or [Screenity](https://chrome.google.com/webstore/detail/screenity-screen-recorder/kbbdabhdfibnancpjfhlkhafgdilcnji)*

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + CSS (no UI library) |
| AI | Groq API — LLaMA 3.3 70B |
| Job Search | JSearch via RapidAPI |
| PDF Parsing | pdfjs-dist (client-side, no backend) |
| Hosting | Vercel |

---

## Features

### 6-phase flow
1. **Resume Upload** — PDF upload or paste as text
2. **Job Search** — Search via JSearch (SG-filtered) or paste any JD manually
3. **Match Score** — AI analysis with keyword highlighting
4. **Tailor Resume** — AI rewrites your bullets + generates cover letter
5. **Interview Prep** — AI generates 8 questions with suggested answers
6. **Job Tracker** — Track application status (Applied → Interviewing → Offer/Rejected)

### Highlights
- PDF parsed entirely client-side — your resume never leaves the browser
- Singapore-focused job search with employment type filters
- Paste JD tab supports LinkedIn, Indeed, MyCareersFuture, company sites
- Editable AI outputs — tweak before copying
- Regenerate button on AI phases for alternative outputs

---

## Getting Started

### Prerequisites
- Node.js 16+
- [Groq API key](https://console.groq.com) (free)
- [JSearch API key](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) (free tier — 200 req/month)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/jobmatch-ai.git
cd jobmatch-ai

# 2. Install dependencies
npm install

# 3. Copy the PDF worker
cp node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs public/

# 4. Set up environment variables
cp .env.example .env
# Fill in your API keys in .env

# 5. Start the dev server
npm start
```

### Environment Variables

Create a `.env` file in the project root:

```
REACT_APP_GROQ_KEY=your_groq_key_here
REACT_APP_JSEARCH_KEY=your_jsearch_key_here
```

---

## Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add your environment variables in the Vercel dashboard:
**Project → Settings → Environment Variables**

Add both `REACT_APP_GROQ_KEY` and `REACT_APP_JSEARCH_KEY`.

---

## Project Structure

```
src/
├── components/
│   ├── ResumeUpload.jsx     # Phase 1 — PDF upload + text paste
│   ├── JobSearch.jsx        # Phase 2 — JSearch API + Paste JD
│   ├── MatchScore.jsx       # Phase 3 — AI match analysis + keyword highlighting
│   ├── TailoredResume.jsx   # Phase 4 — AI resume rewrite + cover letter
│   ├── InterviewPrep.jsx    # Phase 5 — AI interview questions
│   └── JobTracker.jsx       # Phase 6 — Application status tracker
├── App.jsx                  # Main app, state management
├── App.css                  # Full dark theme styling
└── index.js                 # Entry point
```

---

## Roadmap

- [ ] Export tailored resume as PDF
- [ ] Save job history to localStorage
- [ ] Multi-resume support (fresher vs experienced)
- [ ] Chrome extension to auto-pull JD from LinkedIn

---

## License

MIT
