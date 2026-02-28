#VitaFlow – Bridging the Gap Between Health Data and Daily Consistency
VitaFlow is a prevention-first health lifestyle platform that uses structured onboarding questionnaires and AI analysis to generate personalized challenges and track user progress over time.
The application is designed with a mobile-first layout, making it fully accessible via web while optimized for mobile usage.
Core Features Overview
Registration and login powered by Supabase Auth
Multi-step onboarding questionnaire (medical background, baseline, lifestyle, motivation, practical data)
AI chatbot with symptom summarization and risk assessment
Specialty-based doctor recommendation (when relevant) based on a predefined database
Future direction: selected private clinics (for example, MediCover) may enter partnership agreements with VitaFlow. Through these collaborations, their medical specialists could be recommended by the AI feature. In relevant health scenarios, users would receive personalized guidance on which specialist to consult. In later development phases, GPS integration would enable location-based specialist recommendations.
Automatic personalized challenge generation after onboarding
Tracker dashboard with progressive overload-focused weekly planning
Per-user persistence for profile, chat, onboarding, and goals
Future feature: medical report interpretation (blood tests, MRI, etc.) with clear, user-friendly explanations to bridge the communication gap between doctors and patients
1) AI Chatbot – Detailed Capabilities
What It Does
Processes user input (text or voice)
Provides a short, supportive summary of the user's condition
Estimates risk level (low, moderate, high)
Recommends relevant medical specialists when risk is elevated
Includes fallback logic if the AI service is temporarily unavailable
Key Behaviors
Multilingual symptom keyword fallback (HU / EN)
Context-aware responses (not static templates)
Voice input support with HU / EN toggle
Automatic chat history saving and per-user reload
Why It Is Valuable in a Demo
Demonstrates real AI-driven value (beyond UI)
End-to-end user experience: conversation → risk estimation → recommendation → next step
2) Tracker – Detailed Capabilities
What It Tracks
Goal completion status
Progress percentage (pie chart and line/bar chart)
Streak count
Goal distribution (completed vs. remaining)
Zero-State and Personalization
New users start from zero (0 goals, 0% progress, 0 streak)
AI-generated challenges after onboarding automatically populate the goal list
All data is stored per user via the goals-data API
Progressive Plan (Challenge Focus)
Week-labeled tasks (Week 1, Week 2, Week 3, etc.) displayed in a dedicated block
“Current focus: Week X” highlighting for the active week
Progressive overload logic (gradually increasing difficulty)
3) Profile Section – Detailed Capabilities
What It Displays
User identification data
Onboarding-derived data:
Medical background
Baseline
Lifestyle
Motivation
Practical information
Active goal list with status
Data Source
Profile initialization handled by /api/profile/init
Profile data stored in Supabase
Legacy fallback storage supported for compatibility
User Experience
Data persists after refresh or re-login
Not a local demo state — fully account-bound persistence
4) Onboarding-Based Challenge Generation
Process
User completes the 5-step onboarding questionnaire
After clicking “Complete,” the client calls the challenge generation API
The API uses Azure OpenAI to generate a challenge list
If AI fails, a rule-based fallback challenge list is generated
Challenges are automatically inserted into the goal system
Output Characteristics
4–6 specific challenges
Daily or Weekly frequency
Progressive week-labeled tasks (e.g., Week 1 → Week 2 → Week 3)
5) Medical Report Analyzer – Implementation Plan
Current Status
Upload UI already implemented (drag & drop / file picker)
System detects uploaded reports (hasUploadedReport user-scoped flag)
AI service function exists for textual report summarization
Recommended Production-Level Implementation (Future Development)
A) Backend File Upload
Secure server-side storage
Authenticated user access only
B) Text Extraction (OCR / Parsing)
Extract readable content from PDF or image-based reports
C) AI Summarization and Structuring
Call AI summary service
Return structured JSON output including:
Key findings
Abnormal values
Warnings
Suggested monitoring points
Mandatory “not a diagnosis” disclaimer
D) Chat and Tracker Integration
Chat uses the latest report summary as context
Tracker challenges adjusted based on medical findings (e.g., intensity correction)
Doctor recommendation specialty prioritization based on report results
E) Security and Minimum Compliance
Only authenticated users can access their own reports
Service role key strictly server-side
PII/PHI minimized in logs
Defined data retention and deletion policy
