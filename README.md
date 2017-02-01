# firebase-sqs
Bridge between Firebase and Amazon SQS.

A simple script which pulls a given Firebase database location and moves every child to an Amazon SQS (fifo) queue.

Usage:
- Create a Amazon SQS fifo queue (should work with regular queue also, but may need some changes)
- Set the environment variables in the .env file or in your environment (Docker, Heroku, etc.)
- Run the server with "node server.js"

Purpose:
- Prevent backend services from accessing Firebase directly
- Prevent frontend from accessing SQS directly
- Provide redundancy, fail-over, consumer synchronization, etc., all SQS goodies