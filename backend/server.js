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
                                "processing": "washed/natural/honey/anaerobic/etc",
                                "variety": "bean variety if visible",
                                "flavorNotes": ["flavor", "notes", "array"],
                                "elevation": "elevation if visible",
                                "confidence": "high/medium/low based on image clarity",
                                "brewingProfile": {
                                    "baseTemp": 200,
                                    "grindSize": "medium-fine",
                                    "totalTime": 4.5,
                                    "waterRatio": 16,
                                    "bloomRatio": 2,
                                    "bloomTemp": 200,
                                    "bloomTime": 45,
                                    "steps": [
                                        {
                                            "stepNumber": 1,
                                            "temp": 200,
                                            "time": "0:00-0:45",
                                            "action": "Bloom with 2x coffee weight in water",
                                            "pourPattern": "center",
                                            "waterAmount": "bloom"
                                        },
                                        {
                                            "stepNumber": 2, 
                                            "temp": 196,
                                            "time": "0:45-2:30",
                                            "action": "Slow spiral pour to 60% total water",
                                            "pourPattern": "spiral",
                                            "waterAmount": "60%"
                                        },
                                        {
                                            "stepNumber": 3,
                                            "temp": 192,
                                            "time": "2:30-4:30", 
                                            "action": "Final pour and gentle drawdown",
                                            "pourPattern": "spiral",
                                            "waterAmount": "remaining"
                                        }
                                    ]
                                }
                            }

                            Use these evidence-based brewing parameters from specialty coffee data:

                            WATER RATIOS: 1:14 to 1:18 (most common: 1:16)
                            - Light roasts: 1:15-1:16 (stronger extraction needed)
                            - Medium roasts: 1:16-1:17 (balanced)
                            - Dark roasts: 1:17-1:18 (avoid over-extraction)

                            BLOOM PARAMETERS:
                            - Bloom ratio: 1:2 to 1:3 (water to coffee)
                            - Bloom time: 30-45 seconds
                            - Bloom temp: 190-210°F based on roast level

                            TEMPERATURE PROFILES:
                            - Light roasts: 200-210°F (higher extraction needed)
                            - Medium roasts: 195-205°F (balanced approach)
                            - Dark roasts: 185-195°F (prevent over-extraction)
                            - Descending temperature: Start high, drop 3-5°F per step

                            ORIGIN-SPECIFIC ADJUSTMENTS:
                            - Ethiopian: Higher temps (200-210°F), longer bloom (45s), emphasize floral/fruit notes
                            - Colombian: Balanced temps (195-205°F), 30-45s bloom, highlight chocolate/caramel
                            - Kenyan: Aggressive extraction (205-210°F), shorter bloom (30s), bring out wine-like acidity
                            - Guatemala: Medium-high temps (198-208°F), spiral pours, enhance chocolate/spice
                            - Costa Rica: Medium temps (195-200°F), gentle extraction, preserve honey sweetness
                            - Brazilian: Lower temps (185-195°F), longer extraction, nutty/chocolate emphasis

                            PROCESSING METHOD IMPACT:
                            - Washed: Standard parameters, clean extraction
                            - Natural: Reduce temperature 5°F, extend time 15-30s, emphasize fruit sweetness
                            - Honey: Medium adjustment, balance sweetness and acidity
                            - Anaerobic: Lower temps, careful extraction to preserve unique fermentation notes

                            ELEVATION CONSIDERATIONS:
                            - High elevation (1800+ MASL): Higher temps, finer grind
                            - Medium elevation (1200-1800 MASL): Standard parameters
                            - Lower elevation (<1200 MASL): Slightly lower temps

                            GRIND SIZE GUIDANCE:
                            - Light roasts: Medium-fine (more extraction surface)
                            - Medium roasts: Medium (balanced extraction)
                            - Dark roasts: Medium-coarse (prevent over-extraction)

                            Generate precise brewing parameters that optimize for the coffee's specific origin, processing, roast level, and elevation. Create a 3-step temperature descending profile with specific timings and techniques.
                            
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