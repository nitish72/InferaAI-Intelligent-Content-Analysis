# FlowReadme

## Project Name
Infera AI is a full-stack content analysis platform with a React frontend and a FastAPI backend.

It supports:
- user signup and login
- password reset link generation
- text analysis
- URL preview and URL analysis
- PDF/DOCX upload analysis
- saved history
- notifications
- document chat
- export to TXT, PDF, and DOCX

## Current Working Status
I verified these modules locally on May 21, 2026:
- backend health endpoint working on `http://127.0.0.1:8000`
- frontend dev server working on `http://127.0.0.1:5173`
- signup working
- login working
- `/api/auth/me` working
- text summarization working
- URL preview working
- URL summarization working
- DOCX file summarization working
- chat working
- history save and fetch working
- notifications creation and fetch working

Important note:
- if `GROQ_API_KEY` is available, the backend uses Groq
- if `GROQ_API_KEY` is missing, the app now uses a local fallback summarizer and fallback chat path so the demo still works reliably

## Folder Structure
```text
AI Infra Fullstack App/
├─ backend/
│  ├─ app/
│  │  ├─ api/
│  │  │  ├─ auth.py
│  │  │  ├─ deps.py
│  │  │  └─ routes.py
│  │  ├─ core/
│  │  │  ├─ config.py
│  │  │  ├─ database.py
│  │  │  ├─ excel_db.py
│  │  │  ├─ mongodb.py
│  │  │  └─ security.py
│  │  ├─ services/
│  │  │  ├─ document_parser.py
│  │  │  └─ summarizer.py
│  │  ├─ main.py
│  │  └─ models.py
│  ├─ storage/
│  ├─ requirements.txt
│  └─ .env.example
├─ frontend/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ pages/
│  │  ├─ App.jsx
│  │  ├─ AuthContext.jsx
│  │  ├─ AuthModal.jsx
│  │  ├─ ChatPanel.jsx
│  │  ├─ exportUtils.js
│  │  ├─ SentimentChart.jsx
│  │  └─ useHistory.js
│  ├─ package.json
│  └─ vite.config.js
├─ README.md
└─ FlowReadme.md
```

## Code Flow

## 1. Frontend boot flow
Files involved:
- `frontend/src/main.jsx`
- `frontend/src/AuthContext.jsx`
- `frontend/src/App.jsx`

Flow:
1. `main.jsx` mounts the React app.
2. `AuthProvider` wraps the app and manages token/user state.
3. `App.jsx` provides shared app context:
   - theme
   - history
   - notifications
   - current navigation state
4. The page shell renders:
   - `Sidebar`
   - `Navbar`
   - route-like page switching with local React state

## 2. Authentication flow
Files involved:
- `frontend/src/AuthModal.jsx`
- `frontend/src/AuthContext.jsx`
- `backend/app/api/auth.py`
- `backend/app/api/deps.py`
- `backend/app/core/security.py`

Flow:
1. User signs up or logs in from the modal.
2. Frontend calls:
   - `POST /api/auth/signup`
   - `POST /api/auth/login`
3. Backend hashes passwords with bcrypt.
4. Backend returns a JWT access token.
5. Frontend stores token in local storage.
6. Frontend calls `GET /api/auth/me` to restore the user profile.

## 3. Analysis flow
Files involved:
- `frontend/src/pages/AnalysisPage.jsx`
- `backend/app/api/routes.py`
- `backend/app/services/document_parser.py`
- `backend/app/services/summarizer.py`

### Text flow
1. User enters text.
2. Frontend sends `POST /api/summarize/text`.
3. Backend validates the JWT.
4. Backend sends text into `generate_summary(...)`.
5. Result is returned with:
   - concise summary
   - detailed summary
   - key points
   - insights
   - keywords
   - metadata
   - tone analysis
   - source text

### URL flow
1. User enters a URL.
2. Frontend can call `GET /api/preview/url`.
3. Backend fetches HTML with `requests`.
4. Backend parses readable text with BeautifulSoup.
5. Backend summarizes the extracted content.

### File flow
1. User uploads a PDF or DOCX.
2. Frontend sends multipart form data to `POST /api/summarize/file`.
3. Backend extracts text:
   - PDF using `pdfplumber`
   - DOCX using `python-docx`
4. Backend summarizes the extracted text.

## 4. AI engine flow
File involved:
- `backend/app/services/summarizer.py`

Current behavior:
- tries Groq first if `GROQ_API_KEY` exists
- falls back to local extractive analysis if Groq is unavailable

### Groq mode
- uses `groq` client
- requests structured JSON output
- supports long documents by chunking text first

### Fallback mode
- extracts key sentences by word-frequency scoring
- generates summary fields locally
- calculates simple keywords and sentiment locally
- answers chat questions using sentence matching from the original context

Benefit:
- the project can still be demoed even without paid API access or external connectivity

## 5. History flow
Files involved:
- `frontend/src/useHistory.js`
- `frontend/src/pages/HistoryPage.jsx`
- `backend/app/api/routes.py`
- `backend/app/core/excel_db.py`

Flow:
1. After analysis, frontend saves an entry with `POST /api/history`.
2. Backend stores the record in Excel.
3. Frontend loads history with `GET /api/history`.
4. Clicking a history item reopens its result in the analysis page.
5. Delete and clear actions call backend delete routes.

## 6. Notification flow
Files involved:
- `frontend/src/App.jsx`
- `frontend/src/components/Navbar.jsx`
- `backend/app/api/routes.py`

Flow:
1. Backend creates a notification whenever an analysis is saved.
2. Frontend loads notifications from `GET /api/notifications`.
3. User can mark one or all as read.
4. Backend persists read state.

## 7. Chat flow
Files involved:
- `frontend/src/ChatPanel.jsx`
- `backend/app/api/routes.py`
- `backend/app/services/summarizer.py`

Flow:
1. User opens a saved analysis.
2. Chat panel sends `POST /api/chat` with:
   - document context
   - conversation messages
3. Backend answers using Groq if configured.
4. Otherwise, backend uses local sentence-matching fallback.

## 8. Export flow
File involved:
- `frontend/src/exportUtils.js`

Supported exports:
- TXT using browser `Blob`
- PDF using `jspdf`
- DOCX using `docx`

## Libraries Used

## Frontend libraries
Installed from `frontend/package.json`:
- `react`
- `react-dom`
- `vite`
- `@vitejs/plugin-react`
- `lucide-react`
- `react-dropzone`
- `recharts`
- `jspdf`
- `docx`
- `tailwindcss`
- `postcss`
- `autoprefixer`
- `eslint`

## Backend libraries
Installed from `backend/requirements.txt`:
- `fastapi`
- `uvicorn`
- `groq`
- `pdfplumber`
- `python-docx`
- `beautifulsoup4`
- `requests`
- `python-multipart`
- `passlib[bcrypt]`
- `python-jose[cryptography]`
- `sqlalchemy`
- `pandas`
- `openpyxl`
- `python-dotenv`

## What each core library is used for
- `FastAPI`: backend API framework
- `Uvicorn`: ASGI server for FastAPI
- `Groq`: LLM integration when API key is available
- `pdfplumber`: PDF text extraction
- `python-docx`: DOCX read/write support
- `BeautifulSoup4`: website text extraction
- `requests`: HTTP fetching for URL analysis
- `python-multipart`: upload support for file analysis
- `passlib` and `bcrypt`: secure password hashing
- `python-jose`: JWT token creation and verification
- `pandas` and `openpyxl`: Excel-based app persistence
- `React`: frontend UI
- `Vite`: frontend dev/build tool
- `react-dropzone`: drag-and-drop file upload UX
- `recharts`: sentiment charts
- `jspdf` and `docx`: export reports
- `lucide-react`: icons

## Storage Strategy
Current live persistence is Excel-based:
- `backend/storage/users.xlsx`
- `backend/storage/history.xlsx`
- `backend/storage/tokens.xlsx`
- `backend/storage/notifications.xlsx`

Why this helps:
- simple local demo setup
- easy to inspect data manually
- no external DB required for interview demo

There is also SQLite and MongoDB-related code in the repo, but the active running app currently relies on Excel storage.

## How to Run

## Backend
```powershell
cd "C:\Users\nitis\OneDrive\Desktop\AI Infra Fullstack App\backend"
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Optional for live Groq usage:
1. create `backend/.env`
2. add:
```env
GROQ_API_KEY=your_real_key_here
```

## Frontend
```powershell
cd "C:\Users\nitis\OneDrive\Desktop\AI Infra Fullstack App\frontend"
npm install
npm run dev
```

Open:
- frontend: `http://127.0.0.1:5173`
- backend docs: `http://127.0.0.1:8000/docs`

## Why this project is useful to others
This project is useful because it demonstrates how to build a practical full-stack AI application with real product value.

It benefits others by showing:
- how to connect React to FastAPI cleanly
- how to build document and URL ingestion flows
- how to add auth to an AI app
- how to store history and notifications without a heavy database
- how to create exportable reports
- how to design for graceful fallback when external AI APIs are unavailable

For interviews, this project is strong because it shows:
- frontend state management
- backend API design
- file parsing
- auth and JWT handling
- persistence strategy
- AI integration
- UX around history, notifications, and chat

## Changes made to improve interview readiness
I made these practical fixes:
- fixed backend startup crash on Windows caused by Unicode startup logs
- added `python-dotenv` to backend requirements
- added `backend/.env.example`
- made summarization and chat work without Groq by adding a local fallback mode
- normalized frontend history handling to match backend response shape
- connected frontend clear-history behavior to the backend route
- connected frontend notifications to backend notifications
- removed duplicate client-only analysis notifications

## Remaining note
`npm run build` passes.

`npm run lint` still reports several existing code-quality issues in the original codebase, mostly around stricter React/ESLint rules, but the runtime app is working and the main modules listed above were verified.
