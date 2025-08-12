# Coffee Brewing Optimizer - Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: One-Click Heroku Deploy (Recommended)

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/avidan/claude-coffee/tree/main)

**Steps:**
1. Click the "Deploy to Heroku" button above
2. Enter your app name (e.g., `your-coffee-app-backend`)
3. Add your Claude API key in the `CLAUDE_API_KEY` field
4. Click "Deploy app"
5. Once deployed, copy the app URL (e.g., `https://your-coffee-app-backend.herokuapp.com`)
6. Update the frontend with your backend URL (see step 6 below)

### Option 2: Manual Heroku Deploy

**Prerequisites:**
- Heroku account (free at heroku.com)
- Heroku CLI installed
- Claude API key from console.anthropic.com

**Steps:**

1. **Login to Heroku:**
   ```bash
   heroku login
   ```

2. **Create Heroku app:**
   ```bash
   cd backend
   heroku create your-coffee-app-backend
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set CLAUDE_API_KEY=your_actual_claude_api_key_here
   ```

4. **Deploy:**
   ```bash
   git add .
   git commit -m "Add Heroku config"
   git push heroku main
   ```

5. **Test deployment:**
   ```bash
   heroku open /health
   ```

### Option 3: Railway Deploy (Alternative)

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Click "Deploy from GitHub"
3. Connect your repository
4. Select the `backend` folder as the root
5. Add environment variable: `CLAUDE_API_KEY=your_key_here`
6. Deploy and copy the URL

---

## 📝 After Backend Deployment

### 6. Update Frontend with Backend URL

Once your backend is deployed, update the frontend:

1. **Edit `index.html`** and find this line (around line 190):
   ```javascript
   : 'https://your-backend-url.herokuapp.com';
   ```

2. **Replace with your actual backend URL:**
   ```javascript
   : 'https://your-coffee-app-backend.herokuapp.com';
   ```

3. **Commit and push the change:**
   ```bash
   git add index.html
   git commit -m "Update backend URL for production"
   git push
   ```

4. **Wait 1-2 minutes** for GitHub Pages to rebuild

---

## 🔧 Environment Variables Needed

| Variable | Description | Example |
|----------|-------------|---------|
| `CLAUDE_API_KEY` | Your Claude API key | `sk-ant-api03-...` |
| `PORT` | Server port (auto-set by Heroku) | `3001` |

---

## 📊 Testing Your Deployment

1. **Test backend health:**
   ```bash
   curl https://your-coffee-app-backend.herokuapp.com/health
   ```
   Should return: `{"status":"ok","message":"Coffee Brewing Optimizer Backend is running!"}`

2. **Test full app:**
   - Go to your GitHub Pages URL: `https://avidan.github.io/claude-coffee/`
   - Take/upload a coffee bag photo
   - Click "Analyze & Generate Recipe"
   - Should work without asking for API key!

---

## 💰 Cost Information

- **Heroku**: Free tier available (550-1000 hours/month)
- **Railway**: $5/month for unlimited usage
- **Claude API**: Pay-per-use (~$0.01-0.02 per image analysis)

---

## 🔧 Troubleshooting

**Backend not responding:**
- Check Heroku logs: `heroku logs --tail`
- Verify CLAUDE_API_KEY is set: `heroku config`

**CORS errors:**
- Make sure your GitHub Pages URL is in the CORS origins list in `server.js`

**API key issues:**
- Get a new key from [console.anthropic.com](https://console.anthropic.com/)
- Make sure it has credits available

---

## 📱 Your App URLs

After deployment, you'll have:
- **Frontend**: `https://avidan.github.io/claude-coffee/`
- **Backend**: `https://your-coffee-app-backend.herokuapp.com/`

Users can now use your coffee brewing optimizer without needing their own Claude API key!