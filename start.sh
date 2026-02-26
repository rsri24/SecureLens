#!/bin/bash

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
