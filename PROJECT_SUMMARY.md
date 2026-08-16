# Convoo – Full Project Summary

Use this summary when discussing the project (e.g. in ChatGPT) so the full context is clear.

---

## What Convoo Is

**Convoo** is a full-stack **AI mock interview** web app. A user picks an interview category (HR, Technical, or Behavioral), goes through a **5-question** voice interview with a virtual interviewer, and at the end gets **scores and feedback** on their answers. The interviewer’s lines are spoken via text-to-speech and shown as subtitles; the user answers by recording their voice, which is transcribed and then drives the next question.

---

## Tech Stack

- **Frontend:** React 18, React Router 6, Vite, Tailwind CSS, Framer Motion, Lucide React, Axios. Runs on port 3000 (dev) with a proxy to the backend.
- **Backend:** Node.js, Express, TypeScript (compiled to `dist/`), CORS, dotenv, Axios, Multer, Form-data. Runs on port 5001. Legacy routes are plain JavaScript; the main interview pipeline is TypeScript.
- **APIs/Services actually used:**
  - **Deepgram** – Speech-to-text for the user’s recorded answers (`DEEPGRAM_API_KEY` in `.env`).
  - **Google Translate TTS** – Free public endpoint for turning interviewer text into speech (no API key).
  - **Hugging Face Inference API** – `microsoft/DialoGPT-medium` for evaluating each answer (relevance, fluency, confidence, feedback). Optional `HUGGINGFACE_API_KEY`; falls back to mock scores if missing or on failure.
- **No external talking-avatar API** – The “avatar” is an animated placeholder; the backend returns an audio data URL (base64 MP3). Optional placeholders in `.env` (ElevenLabs, D-ID) are not used in the current flow.
- **Browser APIs:** `getUserMedia` + `MediaRecorder` for recording, `speechSynthesis` as fallback when backend TTS fails.

---

## High-Level User Flow

1. **Home** – User sees categories (HR, Technical, Behavioral) from `GET /api/categories` (backed by `backend/data/questions.json`). Clicking a category navigates to `/interview/:category`.
2. **Interview page** – Renders `InterviewScreen` with that category. A unique **session ID** is generated client-side and reused for the whole session.
3. **Session start** – On mount, the frontend calls `POST /interview` with an **empty transcript**. The backend returns the first question: **“Hello, tell me about yourself.”** That text is spoken (TTS) and shown as a subtitle before the user says anything.
4. **Per question (1–5):**
   - User taps the mic, records (WebM/Opus), stops.
   - Frontend sends the audio to `POST /api/transcribe` (Deepgram). Receives transcription text.
   - Frontend sends `POST /interview` with `{ transcript, sessionId, category }`. Backend:
     - Stores the answer and advances question number.
     - Returns the next question text (and optionally audio). For Q1 it’s fixed; for Q2–5 it uses category-specific templates and may inject keywords from the user’s first answer.
   - Frontend plays the returned audio (or browser TTS if no audio) and shows the subtitle. When playback ends, state goes to “idle” so the user can record the next answer.
5. **After the 5th answer** – Backend marks the session complete. Frontend does **not** auto-redirect. It shows a **“Finish Interview & View Score”** button. User clicks it when ready.
6. **Results** – Frontend calls `POST /interview/results` with `sessionId`. Backend loads stored Q/A pairs, runs each through `evaluate.js` (Hugging Face or mock), aggregates scores, clears the session, and returns scores + answers + evaluations. Frontend navigates to `/results` and shows score cards and feedback.

---

## Backend Structure

- **Entry:** `server.ts` – Express app, CORS, JSON/urlencoded body, mounts routes. Legacy JS routes are required with `path.join(__dirname, '..', 'routes', '...')` so they work when running from `dist/server.js`.
- **Interview pipeline (TypeScript):**
  - **`routes/interviewRoute.ts`**
    - `POST /interview` – Body: `transcript`, `sessionId`, `category`. Calls `generateInterviewerReply()` → `textToSpeech()` → `generateAvatarVideo()`. Returns `{ replyText, videoUrl, sessionId, isComplete, questionNumber }`. **Important:** For `questionNumber === 1`, reply text is forced to “Hello, tell me about yourself.” and any “didn’t catch that / repeat” style text is replaced with that line.
    - `POST /interview/results` – Body: `sessionId`. Uses `getSessionAnswers(sessionId)`, evaluates each answer via `utils/evaluate.js`, returns scores and evaluations, then clears the session.
  - **`services/interviewerEngine.ts`** – In-memory session store (Map by sessionId). Per session: `questionNumber` (0–5+), `category`, `answers[]`, `firstAnswer`. Logic:
    - Q1: Always returns “Hello, tell me about yourself.” (no user input needed for first request).
    - On each request with non-empty transcript and current Q 1–5: append `{ question, answer }` to `answers`, set `firstAnswer` if Q1, increment `questionNumber`.
    - Q2–5: Next question from category-specific templates; keywords from `firstAnswer` can be injected. (Code also has an optional Hugging Face–based question generator; current flow uses templates.)
    - After 5 questions answered, returns a closing message and `isComplete: true`.
  - **`services/ttsService.ts`** – Google Translate TTS URL → MP3 buffer.
  - **`services/avatarService.ts`** – Buffers to base64 audio data URL (no external avatar API).
- **Legacy routes (JavaScript, under `/api`):**
  - **`routes/interviewRoutes.js`** – `GET /api/categories`, `GET /api/questions/:category` (from `data/questions.json`).
  - **`routes/whisperRoutes.js`** – `POST /api/transcribe` (Multer upload), calls `utils/whisper.js` which uses **Deepgram** `POST https://api.deepgram.com/v1/listen` (e.g. model `nova-2`).
  - **`routes/evaluationRoutes.js`** – Legacy evaluate endpoints; the new flow uses `evaluate.js` directly from `interviewRoute.ts`.
- **`utils/evaluate.js`** – Sends question + answer to Hugging Face DialoGPT; expects JSON with relevance, fluency, confidence, overallScore, feedback. On failure or parse error, returns a random mock evaluation.

---

## Frontend Structure

- **App** – React Router: `/` (Home), `/interview/:category` (Interview), `/results` (Results). No global state library.
- **Pages:**
  - **Home** – Fetches categories, renders `CategoryCard`s, navigates to `/interview/:category`.
  - **Interview** – Reads `:category`, optionally validates via `GET /api/questions/:category`, renders `InterviewScreen` with that category.
  - **Results** – Reads `location.state` (category, scores, answers, evaluations) and renders score cards and feedback.
- **Components:**
  - **InterviewScreen** – Core interview UI. State: idle / listening / processing / avatarSpeaking; questionNumber; isComplete; readyToFinish; hasStarted. On mount, calls `POST /interview` with empty transcript to get and play Q1. Uses **MicRecorder** for record → upload → transcribe; then `POST /interview` with transcript to get next question; **AvatarPlayer** plays audio and shows subtitle. When backend reports completion after 5 answers, shows “Finish Interview & View Score” button; on click calls `POST /interview/results` and navigates to Results.
  - **MicRecorder** – `getUserMedia` + `MediaRecorder` (WebM/Opus), sends blob to parent’s `onRecordingComplete`.
  - **AvatarPlayer** – Plays `videoUrl` (audio data URL) or, if missing, uses `speechSynthesis` with `subtitle`; `onEnded` when done.
  - **CategoryCard** – Single category tile on Home.
  - **ScoreCard** – Single score/feedback block on Results.

---

## Important Implementation Details

- **First question guarantee:** The route layer forces the first reply to be “Hello, tell me about yourself.” for `questionNumber === 1` and filters out “didn’t catch / could you repeat” style text so the user never hears that as the opener.
- **Session identity:** One session ID per interview (generated on InterviewScreen mount). Stored server-side in the interviewer engine Map; cleared after results are fetched.
- **5-question cap:** Engine only advances through 5 questions; after the 5th answer it returns a closing line and `isComplete: true`. Frontend treats “complete” only when `isComplete && questionNumber > 5` so the user can still answer Q5 before seeing the finish button.
- **Build and run:** Backend: `npm run build` (tsc) then `npm start` (node dist/server.js). Frontend: `npm run dev` (Vite). Frontend proxy sends `/api` and `/interview` to the backend (e.g. port 5001).

---

## Environment (.env in backend)

- **Required for transcription:** `DEEPGRAM_API_KEY`
- **Optional:** `HUGGINGFACE_API_KEY` (evaluation; mock used if missing)
- **Optional:** `TTS_LANG` (default en-US for Google TTS)
- **Optional/unused in current flow:** `ELEVENLABS_API_KEY`, `DID_API_KEY`
- **Config:** `PORT` (default 5001), `NODE_ENV`, `FRONTEND_ORIGIN` (production CORS)

---

This summary describes the whole project and its working end-to-end for use in ChatGPT or similar context.
