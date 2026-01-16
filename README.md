# 🕵️ Shadow Signal

A realtime multiplayer social deduction game built with Next.js, TypeScript, and Socket.io.

## 🎮 Game Overview

Shadow Signal is a party game where players try to identify who doesn't belong based on hidden roles and secret words. The game supports two exciting modes:

### Infiltrator Mode
- **Citizens** (majority) receive the same secret word
- **Infiltrator** (1 player) receives no word
- Citizens must identify and eliminate the Infiltrator
- Infiltrator wins if they survive until the final round

### Spy Mode
- **Agents** (majority) receive the same word
- **Spy** (1 player) receives a similar but different word
- Agents must find the Spy
- Spy must blend in and avoid detection

## 🚀 Features

- ✅ Realtime multiplayer gameplay with Socket.io
- ✅ Two distinct game modes (Infiltrator & Spy)
- ✅ AI-powered word generation and hints
- ✅ Beautiful, mobile-friendly UI
- ✅ Real-time synchronization of game state
- ✅ Voting and elimination mechanics
- ✅ Turn-based speaking phases

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Node.js with Socket.io
- **Realtime**: Socket.io for WebSocket connections
- **AI**: OpenAI API for word generation and hints
- **Styling**: CSS with glassmorphism design

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd shadow-signal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file:
```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

This will start both the Next.js app (port 3000) and the Socket.io server (port 3001).

## 🏗️ Architecture

### Project Structure

```
shadow-signal/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── ai/           # AI integration endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Lobby.tsx          # Game lobby
│   ├── GameRoom.tsx       # Main game room
│   └── VotingPhase.tsx    # Voting interface
├── lib/                   # Utility libraries
│   ├── socket.ts          # Socket.io client
│   └── ai.ts              # AI helper functions
├── types/                 # TypeScript types
│   └── game.ts            # Game type definitions
├── server.js              # Socket.io server
├── words.json             # Word dataset
└── package.json
```

### Realtime Logic

The game uses Socket.io for real-time communication:

1. **Room Management**: Players create or join rooms using unique room codes
2. **State Synchronization**: All game state changes are broadcast to all players in the room
3. **Event-Driven**: Game flow is controlled by events (createRoom, joinRoom, startGame, vote, etc.)
4. **In-Memory Storage**: Game state is stored in memory using Maps (rooms and players)

### Game Flow

1. **Lobby Phase**:
   - Players create or join a room
   - Host selects game mode
   - Minimum 3 players required

2. **Role Assignment**:
   - Server randomly assigns roles
   - Words are assigned based on roles and game mode
   - All players receive their private information

3. **Speaking Phase**:
   - Players take turns (30 seconds each)
   - Each player describes their word without saying it directly
   - AI-generated hints help players

4. **Voting Phase**:
   - All players vote for who they think is suspicious
   - Player with most votes is eliminated

5. **Win Conditions**:
   - Special role eliminated → Citizens/Agents win
   - Only 2 players remain with special role alive → Special role wins

### AI Integration

The game uses OpenAI's GPT-3.5-turbo for:

1. **Word Pair Generation**: In Spy mode, generates similar but different words
2. **Hint Generation**: Provides helpful hints for players to describe their words

AI calls are made through Next.js API routes (`/api/ai`) to keep API keys secure on the server side.

## 🎨 UI/UX Design

- **Glassmorphism**: Modern frosted glass effect with backdrop blur
- **Gradient Backgrounds**: Beautiful purple gradient theme
- **Mobile-First**: Responsive design that works on all screen sizes
- **Real-time Updates**: Smooth state transitions and updates
- **Clear Visual Feedback**: Color-coded states for different game phases

## 🚢 Deployment

### Vercel (Frontend)

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Socket.io Server

The Socket.io server needs to be deployed separately. Options:

1. **Railway**: Deploy `server.js` as a Node.js service
2. **Render**: Deploy as a web service
3. **Heroku**: Deploy as a Node.js app
4. **DigitalOcean**: Use App Platform or Droplet

Update `NEXT_PUBLIC_SOCKET_URL` to point to your deployed server.

### Environment Variables for Production

```env
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.com
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
PORT=3001  # For Socket.io server
```

## 🧪 Testing

To test the game:

1. Open multiple browser windows/tabs
2. Create a room in one window
3. Join the room from other windows with different names
4. Start the game and play through a round

## 📝 Code Quality

- **TypeScript**: Full type safety throughout the codebase
- **Clean Architecture**: Separation of concerns (components, lib, types)
- **Error Handling**: Proper error handling and user feedback
- **Code Comments**: Key logic is documented

## 🔮 Future Enhancements

- [ ] Chat functionality during speaking phase
- [ ] Game history and statistics
- [ ] Custom word lists
- [ ] Timer customization
- [ ] Spectator mode
- [ ] Reconnection handling
- [ ] Sound effects and animations

## 📄 License

This project is created for demonstration purposes.

## 👥 Credits

Built with ❤️ using Next.js, Socket.io, and OpenAI.
