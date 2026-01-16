# 🚀 Deployment Guide

This guide will help you deploy Shadow Signal to production.

## Architecture Overview

The application consists of two parts:
1. **Next.js Frontend** - Deployed on Vercel
2. **Socket.io Server** - Needs separate deployment (Railway, Render, etc.)

## Step 1: Deploy Socket.io Server

### Option A: Railway (Recommended)

1. Go to [Railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Node.js
5. Set the root directory to `/` (or leave default)
6. Add environment variable:
   - `PORT=3001` (Railway will provide a port, but set this for consistency)
7. Deploy
8. Copy the deployment URL (e.g., `https://your-app.railway.app`)

### Option B: Render

1. Go to [Render.com](https://render.com) and sign up
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: shadow-signal-server
   - **Environment**: Node
   - **Build Command**: (leave empty or `npm install`)
   - **Start Command**: `node server.js`
   - **Root Directory**: `/`
5. Add environment variable:
   - `PORT=10000` (Render uses port 10000 by default)
6. Deploy
7. Copy the deployment URL

### Option C: Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create shadow-signal-server`
4. Set buildpack: `heroku buildpacks:set heroku/nodejs`
5. Add Procfile:
   ```
   web: node server.js
   ```
6. Deploy: `git push heroku main`
7. Get URL: `heroku info`

## Step 2: Deploy Next.js Frontend to Vercel

1. Go to [Vercel.com](https://vercel.com) and sign up
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `/` (or leave default)
5. Add Environment Variables:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   NEXT_PUBLIC_SOCKET_URL=https://your-socket-server-url.com
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```
6. Deploy

## Step 3: Update Socket Server CORS

After deploying the frontend, update your Socket.io server's CORS settings:

In `server.js`, update:
```javascript
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app',
    methods: ['GET', 'POST']
  }
});
```

Redeploy the Socket.io server.

## Step 4: Test the Deployment

1. Open your Vercel URL
2. Create a room
3. Open another browser/device
4. Join the room
5. Test the full game flow

## Environment Variables Summary

### Socket.io Server
- `PORT` - Server port (usually auto-assigned by platform)
- `NEXT_PUBLIC_APP_URL` - Your Vercel app URL (for CORS)

### Next.js Frontend
- `OPENAI_API_KEY` - Your OpenAI API key
- `NEXT_PUBLIC_SOCKET_URL` - Your Socket.io server URL
- `NEXT_PUBLIC_APP_URL` - Your Vercel app URL

## Troubleshooting

### Connection Issues
- Check that `NEXT_PUBLIC_SOCKET_URL` points to your Socket.io server
- Verify CORS settings allow your Vercel domain
- Check browser console for WebSocket errors

### AI Not Working
- Verify `OPENAI_API_KEY` is set correctly
- Check API route logs in Vercel dashboard
- Ensure you have OpenAI API credits

### Socket Server Not Starting
- Check server logs in your hosting platform
- Verify `server.js` is in the root directory
- Ensure Node.js version is 18+ (check `package.json` engines)

## Alternative: Single Server Deployment

If you want to deploy everything on one server:

1. Use a platform that supports both Next.js and custom servers
2. Modify `server.js` to serve Next.js as well
3. Deploy as a single application

This is more complex but possible with platforms like DigitalOcean App Platform or AWS.
