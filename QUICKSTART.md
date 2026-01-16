# 🚀 Quick Start Guide

Get Shadow Signal running locally in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- OpenAI API key (optional, for AI features)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
   
   > Note: If you don't have an OpenAI API key, the game will still work but AI hints won't be available.

3. **Start the development servers:**
   ```bash
   npm run dev
   ```
   
   This will start:
   - Next.js app on `http://localhost:3000`
   - Socket.io server on `http://localhost:3001`

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Testing the Game

1. **Create a room:**
   - Enter your name
   - Click "Create Room"
   - Note the room code

2. **Join from another device/browser:**
   - Open a new browser window or use a mobile device
   - Enter your name and the room code
   - Click "Join Room"

3. **Start the game:**
   - The host selects a game mode (Infiltrator or Spy)
   - Click "Start Game" (need at least 3 players)

4. **Play:**
   - Players take turns describing their words
   - Vote for suspicious players
   - Try to identify the special role!

## Troubleshooting

### Port already in use
If port 3000 or 3001 is already in use:
- Kill the process using that port
- Or change the ports in your `.env.local` file

### Socket connection fails
- Make sure both servers are running
- Check that `NEXT_PUBLIC_SOCKET_URL` matches your Socket.io server port
- Check browser console for errors

### AI not working
- Verify your OpenAI API key is correct
- Check that you have API credits
- The game works without AI, but hints won't be generated

## Next Steps

- Read the full [README.md](./README.md) for architecture details
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Customize the word dataset in `words.json`

Enjoy playing Shadow Signal! 🕵️
