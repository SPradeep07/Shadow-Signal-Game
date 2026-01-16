'use client';

import { useState, useEffect } from 'react';
import { connectSocket, getSocket } from '@/lib/socket';
import Lobby from '@/components/Lobby';
import GameRoom from '@/components/GameRoom';
import { Room } from '@/types/game';

export default function Home() {
  const [room, setRoom] = useState<Room | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [view, setView] = useState<'home' | 'lobby' | 'game'>('home');
  const [error, setError] = useState('');

  useEffect(() => {
    const socket = connectSocket();

    socket.on('connect', () => {
      console.log('Connected with socket ID:', socket.id);
    });

    socket.on('roomCreated', ({ roomCode: code, playerName: name }) => {
      setRoomCode(code);
      setPlayerName(name);
      setView('lobby');
    });

    socket.on('joinedRoom', ({ roomCode: code, playerName: name }) => {
      setRoomCode(code);
      setPlayerName(name);
      setView('lobby');
    });

    socket.on('roomUpdate', (updatedRoom: Room) => {
      setRoom(updatedRoom);
      if (updatedRoom.gameState === 'playing' || updatedRoom.gameState === 'finished') {
        setView('game');
      } else if (updatedRoom.gameState === 'lobby') {
        setView('lobby');
      }
    });

    socket.on('gameStarted', (gameRoom: Room) => {
      setRoom(gameRoom);
      setView('game');
    });

    socket.on('error', ({ message }) => {
      setError(message);
      setTimeout(() => setError(''), 3000);
    });

    return () => {
      socket.off('connect');
      socket.off('roomCreated');
      socket.off('joinedRoom');
      socket.off('roomUpdate');
      socket.off('gameStarted');
      socket.off('error');
    };
  }, []);

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    const socket = getSocket();
    if (socket) {
      socket.emit('createRoom', { playerName: playerName.trim() });
    }
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) {
      setError('Please enter your name and room code');
      return;
    }
    const socket = getSocket();
    if (socket) {
      socket.emit('joinRoom', { 
        roomCode: roomCode.trim().toUpperCase(), 
        playerName: playerName.trim() 
      });
    }
  };

  if (view === 'lobby' && room) {
    return <Lobby room={room} playerName={playerName} />;
  }

  if (view === 'game' && room) {
    return <GameRoom room={room} playerName={playerName} />;
  }

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '8px', textAlign: 'center', fontWeight: 'bold' }}>
          🕵️ Shadow Signal
        </h1>
        <p style={{ textAlign: 'center', marginBottom: '32px', opacity: 0.9 }}>
          Realtime Multiplayer Social Deduction Game
        </p>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.2)', 
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="input"
            style={{ marginBottom: '12px' }}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button onClick={handleCreateRoom} className="btn btn-primary" style={{ width: '100%', marginBottom: '12px' }}>
            Create Room
          </button>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '20px',
          gap: '12px'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.2)' }}></div>
          <span style={{ opacity: 0.7 }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.2)' }}></div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Enter room code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            className="input"
            style={{ marginBottom: '12px' }}
            maxLength={6}
            onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
          />
          <button onClick={handleJoinRoom} className="btn btn-primary" style={{ width: '100%' }}>
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}
