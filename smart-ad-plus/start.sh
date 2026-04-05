#!/bin/sh

# Run database migrations
npm run migrate

# Start the application
node src/server.js