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

        // Detect actual image format from base64 data
        function detectImageFormat(base64Data) {
            const header = base64Data.substring(0, 20);
            
            // PNG signature
            if (header.startsWith('iVBORw0KGgo')) {
                return 'image/png';
            }
            // JPEG signature  
            if (header.startsWith('/9j/') || header.startsWith('UklGR')) {
                return 'image/jpeg';
            }
            // GIF signature
            if (header.startsWith('R0lGODlh') || header.startsWith('R0lGODdh')) {
                return 'image/gif';
            }
            // WebP signature
            if (header.startsWith('UklGR') && base64Data.includes('V0VCUw')) {
                return 'image/webp';
            }
            
            // Fallback to provided MIME type
            if (mimeType.includes('png')) return 'image/png';
            if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'image/jpeg';
            if (mimeType.includes('gif')) return 'image/gif';
            if (mimeType.includes('webp')) return 'image/webp';
            
            return 'image/jpeg'; // Default fallback
        }

        const detectedMimeType = detectImageFormat(imageData);
        console.log(`Original MIME: ${mimeType}, Detected: ${detectedMimeType}, Data length: ${imageData.length}`);

        // Call Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
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
                                media_type: detectedMimeType,
                                data: imageData
                            }
                        },
                        {
                            type: 'text',
                            text: `Analyze this coffee bag image and create a complete Fellow Aiden brewing recipe in JSON format:

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
                                "confidence": "high/medium/low based on image clarity",
                                "brewingProfile": {
                                    "baseTemp": 200,
                                    "grindSize": "medium/medium-fine/coarse",
                                    "totalTime": 4.5,
                                    "waterRatio": 16,
                                    "steps": [
                                        {
                                            "stepNumber": 1,
                                            "temp": 205,
                                            "time": "0:00-0:45",
                                            "action": "Bloom with 2x coffee weight in water",
                                            "pourPattern": "center"
                                        },
                                        {
                                            "stepNumber": 2, 
                                            "temp": 200,
                                            "time": "0:45-2:30",
                                            "action": "Slow circular pour to 60% total water",
                                            "pourPattern": "spiral"
                                        },
                                        {
                                            "stepNumber": 3,
                                            "temp": 195,
                                            "time": "2:30-4:30", 
                                            "action": "Final pour and drawdown",
                                            "pourPattern": "spiral"
                                        }
                                    ]
                                }
                            }

                            Generate optimized brewing parameters based on:
                            - Coffee origin characteristics (Ethiopian beans need higher temps, Brazilian beans lower temps, etc.)
                            - Roast level (light roasts need higher temps, dark roasts need lower temps)  
                            - Processing method (washed coffees vs natural process)
                            - Specific flavor notes and bean variety if visible
                            - Fellow Aiden brewing best practices

                            Create 3 brewing steps with decreasing temperatures and specific timing. Consider the coffee's unique characteristics to optimize extraction.
                            
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
            let responseText = data.content[0].text;
            
            // Clean up response - remove markdown code blocks if present
            responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
            
            analysisResult = JSON.parse(responseText);
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