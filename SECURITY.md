# Convoo Security Guide

This document outlines the security procedures and expectations for running and contributing to the Convoo project.

## Environment Variables
The `.env` file should **never** be committed to version control. The repository relies on `.env.example` as a template for environment configuration. 

Before running the server in production, ensure that you provide real, secure values for:
- `JWT_SECRET`: Generate a strong random string (e.g. using `openssl rand -base64 32`).
- `MONGODB_URI`: Point to a secured MongoDB instance.
- Provider API Keys (`DEEPGRAM_API_KEY`, `OPENROUTER_API_KEY`). 

## API Keys Rotation
The API keys initially used during development have been rotated and invalidated as they were exposed in plaintext in the `.env` file. You must use your own provider API keys to interact with the backend services.

## Core Security Additions
- **Helmet**: Used for setting secure HTTP headers.
- **Express Rate Limit**: Set to prevent abuse of our API and AI models, allowing 100 requests per 15 minutes per IP by default.
- **Strict File Uploads**: Audio files for transcriptions are validated safely and cleaned up locally after processing.
- **API Error Masking**: In a production environment (`NODE_ENV=production`), server errors limit exact stack trace and parameter leakage to the client.

## Contact
If you discover a vulnerability in the project, please reach out to the project maintainer directly rather than creating an open issue to prevent immediate malicious exploitation.
