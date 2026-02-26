#!/bin/bash
cd /home/runner/workspace/frontend && npm run build
cd /home/runner/workspace/backend && node server.js
