# Persistent Real-Time AI Chatbot

This is a full-stack web application for a persistent, real-time AI chatbot. It features a React frontend, a Python (FastAPI) backend, and leverages Google's Gemini AI via LangChain for conversational intelligence. User data and chat history are stored in Firebase Firestore, with Firebase Authentication handling user management.

The application is designed to be scalable, secure, and deployable on modern cloud platforms like Vercel and Render.

 
<!-- Replace with a real screenshot URL of your deployed app -->

## ✨ Features

-   **Secure User Authentication**: Users can sign up and log in securely using email and password. Sessions are managed with JWTs provided by Firebase.
-   **Persistent Chat History**: Conversations are saved and associated with user accounts, allowing users to continue their chats across multiple sessions.
-   **Real-Time Streaming Responses**: AI responses are streamed token-by-token for an interactive, real-time user experience, similar to modern AI assistants.
-   **Context-Aware Conversations**: The chatbot remembers the context of the current conversation using LangChain's memory modules to provide relevant and coherent responses.
-   **Modular & Scalable Architecture**: A clear separation between the frontend (React) and backend (FastAPI) allows for independent development and scaling.
-   **Cloud-Ready**: Designed for easy deployment with detailed instructions for Vercel (frontend) and Render (backend).

**Note** : If you want to use it live then sign-in first with an valid email-id(not neccesarily an official email-id) or dummy email-id with password and it will open the main page, then wait for 2-3 seconds then click on new chat to start an conversation with chatbot, after you close the tab, you will not required to login back as It will remember you and it will store all of your chat history based on created timestamp and you can access any chats any time as it have the feature of persistent storage and you can always login with your credentails and get your data back anytime, here's the deployed link:
https://full-stack-llm-chatbot-cgv0jbhsq-priyy08s-projects.vercel.app , You may face delays in chatbot's response sometimes as it is deployed on Render's free version so it is advisable to wait for sometime to get an response back for chatbot, In future I will try to integrate caching mechanisms, purchase of high performance servers, performance enhancments, streaming response etc to make chatbot more capable, Here this is an MVP which demonstrates how we can give an memory/persistent storage to an chatbot which mimics AI Tools like GPT, Gemini, Claude which saves our chat history as well as past conversations and contexts.


## 🛠️ Tech Stack

### Frontend

-   **Framework**: React
-   **State Management**: Redux Toolkit
-   **Styling**: Tailwind CSS
-   **API Communication**: Axios (for REST), Fetch API (for streaming)
-   **Authentication**: Firebase Authentication Client SDK

### Backend

-   **Framework**: FastAPI
-   **Language**: Python 3.11+
-   **AI Integration**: LangChain with `langchain-google-genai`
-   **LLM**: Google Gemini (via `gemini-1.5-flash-latest`)
-   **Database**: Google Firebase Firestore
-   **Real-Time Streaming**: Server-Sent Events (SSE) via `StreamingResponse`

### Infrastructure & Deployment

-   **Frontend Hosting**: Vercel
-   **Backend Hosting**: Render
-   **Database & Auth**: Google Firebase
-   **Containerization**: Docker

## 🚀 Getting Started

Follow these instructions to set up the project for local development.

### Prerequisites

-   Node.js (v16 or later)
-   Python (v3.11 or later)
-   A Google Firebase project
-   A Google Gemini API Key

### 1. Firebase Project Setup

1.  Create a project on the [Firebase Console](https://console.firebase.google.com/).
2.  **Enable Authentication**: Go to `Authentication` -> `Sign-in method` and enable **Email/Password**.
3.  **Create Firestore Database**: Go to `Firestore Database` -> `Create database` and start in **production mode**.
4.  **Create Firestore Indexes**:
    -   After running the app, the backend logs will provide one-click links to create the two required composite indexes (for the `chats` and `messages` collections). You must create these for the app to function.
5.  **Get Web App Credentials (Frontend)**: In `Project Settings`, add a new Web App (`</>`) and copy the `firebaseConfig` object.
6.  **Get Service Account (Backend)**: In `Project Settings` -> `Service accounts`, generate a new private key and download the JSON file.

### 2. Backend Setup (Local)

1.  Navigate to the `backend/` directory:
    ```bash
    cd backend
    ```

2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Rename the downloaded service account key to `firebase-service-account.json` and place it in the `backend/` directory.

5.  Create a `.env` file in the `backend/` directory and add your Gemini API key:
    ```env
    # backend/.env
    GOOGLE_API_KEY="YOUR_GEMINI_API_KEY"
    ```

6.  Run the backend server:
    ```bash
    uvicorn app.main:app --reload
    ```
    The backend will be running at `http://localhost:8000`.

### 3. Frontend Setup (Local)

1.  Navigate to the `frontend/` directory in a new terminal:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Create a `.env` file in the `frontend/` directory and populate it with your Firebase web app config and the local backend URL:
    ```env
    # frontend/.env
    REACT_APP_API_BASE_URL=http://localhost:8000

    REACT_APP_FIREBASE_API_KEY="AIza..."
    REACT_APP_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
    REACT_APP_FIREBASE_PROJECT_ID="your-project"
    REACT_APP_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID="123..."
    REACT_APP_FIREBASE_APP_ID="1:123...:web:..."
    ```

4.  Run the frontend development server:
    ```bash
    npm start
    ```
    The frontend will be running at `http://localhost:3000`.

## ☁️ Deployment

This project is configured for a split deployment.

### Backend on Render

1.  Push your repository to GitHub (ensure `.env` and `*.json` key files are in `.gitignore`).
2.  On Render, create a new "Web Service" and connect your GitHub repo.
3.  Set the **Root Directory** to `backend`.
4.  Set the **Build Command** to `pip install -r requirements.txt`.
5.  Set the **Start Command** to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
6.  In the **Environment** section, add the following environment variables:
    -   `GOOGLE_API_KEY`: Your Gemini API key.
    -   `FIREBASE_CREDENTIALS_JSON`: The **entire content** of your `firebase-service-account.json` file pasted as a single value.
    -   `PYTHON_VERSION`: `3.11` (or your chosen version).
7.  Deploy the service and copy the public URL (e.g., `https://your-backend.onrender.com`).

### Frontend on Vercel

1.  On Vercel, create a new "Project" and connect the same GitHub repo. Vercel will automatically detect it as a Create React App project.
2.  In the project **Settings -> Environment Variables**, add all the `REACT_APP_*` variables from your local `.env` file.
3.  **Crucially, set the `REACT_APP_API_BASE_URL` variable to your live Render backend URL.**
4.  Deploy. Your full-stack application is now live!

## 📝 API Endpoints

The backend exposes the following RESTful endpoints under the `/api` prefix.

| Method | Endpoint                            | Description                                        | Protected |
| :----- | :---------------------------------- | :------------------------------------------------- | :-------- |
| `POST` | `/auth/register`                    | Creates a user profile in Firestore.               | Yes       |
| `POST` | `/chats`                            | Creates a new chat session.                        | Yes       |
| `GET`  | `/chats`                            | Retrieves all chat sessions for the current user.  | Yes       |
| `GET`  | `/chats/{chatId}/messages`          | Retrieves all messages for a specific chat.        | Yes       |
| `POST` | `/chats/{chatId}/stream`            | Sends a user message and streams back an AI response. | Yes       |

---

Thank you for checking out the project!



