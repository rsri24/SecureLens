#!/bin/bash

# Start backend
cd backend
npm install
npm run start &

# Start frontend
cd ../frontend
npm install
npm run dev
