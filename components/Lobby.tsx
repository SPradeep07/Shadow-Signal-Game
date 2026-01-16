'use client';

import { useState } from 'react';
import { getSocket } from '@/lib/socket';
import { Room, GameMode } from '@/types/game';

interface LobbyProps {
  room: Room;
  playerName: string;
}

export default function Lobby({ room, playerName }: LobbyProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  const socket = getSocket();
  const isHost = socket && room.host === socket.id;

  const handleStartGame = () => {
    if (!selectedMode) return;
    const socket = getSocket();
    if (socket) {
      socket.emit('startGame', { roomCode: room.code, gameMode: selectedMode });
    }
  };

  return (
    <div className="container" style={{ minHeight: '100vh', paddingTop: '40px' }}>
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '8px', textAlign: 'center' }}>
          🎮 Game Lobby
        </h1>
        
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '32px',
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px'
        }}>
          <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>Room Code</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '4px' }}>
            {room.code}
          </p>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Players ({room.players.length})</h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {room.players.map((player) => (
              <div
                key={player.id}
                style={{
                  padding: '16px',
                  background: player.id === room.host 
                    ? 'rgba(102, 126, 234, 0.3)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{player.name}</span>
                {player.id === room.host && (
                  <span style={{ 
                    fontSize: '12px', 
                    padding: '4px 8px',
                    background: 'rgba(102, 126, 234, 0.5)',
                    borderRadius: '4px'
                  }}>
                    Host
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {isHost && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Select Game Mode</h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                <button
                  onClick={() => setSelectedMode('infiltrator')}
                  className="btn"
                  style={{
                    width: '100%',
                    background: selectedMode === 'infiltrator' 
                      ? 'rgba(102, 126, 234, 0.5)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    textAlign: 'left',
                    padding: '20px'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🕵️ Infiltrator Mode</div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>
                    Citizens have a secret word. The Infiltrator has no word and must blend in.
                  </div>
                </button>

                <button
                  onClick={() => setSelectedMode('spy')}
                  className="btn"
                  style={{
                    width: '100%',
                    background: selectedMode === 'spy' 
                      ? 'rgba(102, 126, 234, 0.5)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    textAlign: 'left',
                    padding: '20px'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🎭 Spy Mode</div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>
                    Agents have the same word. The Spy has a similar but different word.
                  </div>
                </button>
              </div>
            </div>

            <button
              onClick={handleStartGame}
              disabled={!selectedMode || room.players.length < 3}
              className="btn btn-primary"
              style={{ 
                width: '100%',
                opacity: (!selectedMode || room.players.length < 3) ? 0.5 : 1,
                cursor: (!selectedMode || room.players.length < 3) ? 'not-allowed' : 'pointer'
              }}
            >
              {room.players.length < 3 ? 'Need at least 3 players' : 'Start Game'}
            </button>
          </>
        )}

        {!isHost && (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px'
          }}>
            <p>Waiting for host to start the game...</p>
          </div>
        )}
      </div>
    </div>
  );
}
