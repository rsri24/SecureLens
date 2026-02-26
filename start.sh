#!/bin/bash
cd /home/runner/workspace/backend && node server.js &
sleep 2
cd /home/runner/workspace/frontend && npm run dev
