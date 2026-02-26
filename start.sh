#!/bin/bash
<<<<<<< HEAD
cd /home/runner/workspace/frontend && npm run build
cd /home/runner/workspace/backend && node server.js
=======

# Build frontend
cd frontend
npm install
npm run build

# Start backend
cd ../backend
npm install
npm run start &

# Serve built frontend (Vite preview)
cd ../frontend
npm run preview -- --host 0.0.0.0 --port 5000
>>>>>>> 0d0976047fda2e4b0ea4f20a789f347b9670aef3
