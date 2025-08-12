# Coffee Brewing Optimizer Backend

A simple Express.js backend that securely proxies requests to the Claude API for the Coffee Brewing Optimizer app.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your Claude API key
   ```

3. **Run the server:**
   ```bash
   npm start
   ```

The server will run on port 3001 by default.

## API Endpoints

### `GET /health`
Health check endpoint that returns server status.

### `POST /api/analyze-coffee`
Analyzes coffee bag images using Claude's vision API.

**Request body:**
```json
{
  "imageData": "base64_image_data_without_prefix",
  "mimeType": "image/jpeg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "country": "Colombia",
    "roaster": "Local Roastery",
    "coffeeName": "Colombian Supremo",
    "roastLevel": "medium",
    "flavorNotes": ["chocolate", "caramel", "citrus"],
    "confidence": "high"
  }
}
```

## Environment Variables

- `CLAUDE_API_KEY`: Your Claude API key (required)
- `PORT`: Server port (optional, defaults to 3001)

## Deployment

This backend can be deployed to:
- **Heroku**: Add your Claude API key as an environment variable
- **Vercel**: Deploy as a serverless function
- **Railway**: Simple deployment with environment variables
- **Any VPS**: Run with PM2 or similar process manager

## Security

- API key is stored server-side as an environment variable
- CORS is configured for your frontend domains
- Request body size is limited to 10MB for image uploads