# Quick Setup Guide

## 1. Required Software
Install these on the computer/server:
- **Node.js** (LTS) - nodejs.org
- **Git** - git-scm.com

## 2. How to Run (via Terminal / Host Server)

### Installation
Open your terminal in the project root directory and run:
```bash
npm install
```

### Running the Development Server
To run the server in development mode:
```bash
npm run dev
```
This will start the server and automatically open the application in your web browser.

### Production Deployment
To build and start the server for production hosting:
```bash
npm run build
npm start
```
This will start the production server and automatically open it in your web browser.

## 3. Main Files Created
- `src/components/AccountForm.tsx` (The Form UI)
- `src/components/AccountList.tsx` (The Table UI)
- `src/app/page.tsx` (Main layout)
