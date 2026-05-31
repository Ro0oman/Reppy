@echo off
echo Starting Reppy dev servers...
start "Backend" cmd /k "cd backend && npm run dev"
start "Frontend" cmd /k "cd frontend && npm run dev"
