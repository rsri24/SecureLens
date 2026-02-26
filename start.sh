#!/bin/bash
cd backend && node server.js &
BACKEND_PID=$!
sleep 2
cd frontend && npm run dev
