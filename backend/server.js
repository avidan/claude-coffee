const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:8000',
        'http://localhost:8001', 
        'http://localhost:8002',
        'http://localhost:8003',
        'http://localhost:8004',
        'http://localhost:8005',
        'https://avidan.github.io'
    ]
}));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Coffee Brewing Optimizer Backend is running!' });
});

// Claude API proxy endpoint
app.post('/api/analyze-coffee', async (req, res) => {
    try {
        const { imageData, mimeType } = req.body;
        
        if (!imageData || !mimeType) {
            return res.status(400).json({ error: 'Missing imageData or mimeType' });
        }

        if (!process.env.CLAUDE_API_KEY) {
            return res.status(500).json({ error: 'Claude API key not configured' });
        }

        // Call Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.CLAUDE_API_KEY
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                messages: [{
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: mimeType,
                                data: imageData
                            }
                        },
                        {
                            type: 'text',
                            text: `Analyze this coffee bag image and extract the following information in JSON format:
                            {
                                "country": "country of origin",
                                "region": "specific region/farm if visible",
                                "roaster": "roaster name",
                                "coffeeName": "specific coffee name/blend",
                                "roastLevel": "light/medium/dark",
                                "processing": "washed/natural/honey/etc",
                                "variety": "bean variety if visible",
                                "flavorNotes": ["flavor", "notes", "array"],
                                "elevation": "elevation if visible",
                                "confidence": "high/medium/low based on image clarity"
                            }
                            Only return the JSON, no other text.`
                        }
                    ]
                }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Claude API error:', response.status, errorText);
            return res.status(response.status).json({ 
                error: `Claude API request failed: ${response.status}`,
                details: errorText
            });
        }

        const data = await response.json();
        
        // Parse the JSON response from Claude
        let analysisResult;
        try {
            analysisResult = JSON.parse(data.content[0].text);
        } catch (parseError) {
            console.error('Failed to parse Claude response:', data.content[0].text);
            return res.status(500).json({ 
                error: 'Failed to parse AI response',
                rawResponse: data.content[0].text
            });
        }

        res.json({ success: true, data: analysisResult });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Coffee Brewing Optimizer Backend running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔑 Claude API key configured: ${process.env.CLAUDE_API_KEY ? '✅ Yes' : '❌ No'}`);
});

module.exports = app;