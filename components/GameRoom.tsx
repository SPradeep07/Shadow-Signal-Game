'use client';

import { useState, useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { Room } from '@/types/game';
import VotingPhase from './VotingPhase';
import AIHint from './AIHint';

interface GameRoomProps {
  room: Room;
  playerName: string;
}

export default function GameRoom({ room, playerName }: GameRoomProps) {
  const [timeLeft, setTimeLeft] = useState(30);
  const socket = getSocket();
  const currentPlayerId = socket?.id;
  const isCurrentSpeaker = room.currentSpeaker === currentPlayerId;
  const playerWord = currentPlayerId ? room.words[currentPlayerId] : null;
  const playerRole = currentPlayerId ? room.roles[currentPlayerId] : null;
  const isEliminated = currentPlayerId ? room.eliminated.includes(currentPlayerId) : false;

  useEffect(() => {
    if (room.speakingPhase && room.speakingStartTime) {
      const elapsed = Math.floor((Date.now() - room.speakingStartTime) / 1000);
      const remaining = Math.max(0, 30 - elapsed);
      setTimeLeft(remaining);

      const interval = setInterval(() => {
        if (!room.speakingStartTime) return;

        const newElapsed = Math.floor(
          (Date.now() - room.speakingStartTime) / 1000
        );
        
        const newRemaining = Math.max(0, 30 - newElapsed);
        setTimeLeft(newRemaining);
        
        if (newRemaining === 0) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [room.speakingPhase, room.speakingStartTime]);

  const handleEndSpeaking = () => {
    if (socket) {
      socket.emit('endSpeaking', { roomCode: room.code });
    }
  };

  if (room.gameState === 'finished') {
    const winner = room.winner;
    const playerWon = 
      (winner === 'citizens' && playerRole === 'citizen') ||
      (winner === 'agents' && playerRole === 'agent') ||
      (winner === 'infiltrator' && playerRole === 'infiltrator') ||
      (winner === 'spy' && playerRole === 'spy');

    return (
      <div className="container" style={{ minHeight: '100vh', paddingTop: '40px' }}>
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>
            {playerWon ? '🎉 You Won!' : '😔 You Lost'}
          </h1>
          <p style={{ fontSize: '24px', marginBottom: '32px' }}>
            {winner === 'citizens' && 'Citizens eliminated the Infiltrator!'}
            {winner === 'agents' && 'Agents found the Spy!'}
            {winner === 'infiltrator' && 'The Infiltrator survived!'}
            {winner === 'spy' && 'The Spy avoided detection!'}
          </p>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Your Role</h2>
            <div style={{ 
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              marginBottom: '8px'
            }}>
              <strong>{playerRole}</strong>
            </div>
            {playerWord && (
              <div style={{ 
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px'
              }}>
                <strong>Your word:</strong> {playerWord}
              </div>
            )}
          </div>

          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>All Players</h2>
            {room.players.map((player) => (
              <div
                key={player.id}
                style={{
                  padding: '12px',
                  background: room.eliminated.includes(player.id)
                    ? 'rgba(239, 68, 68, 0.2)'
                    : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{player.name}</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', opacity: 0.7 }}>
                    {room.roles[player.id]}
                  </span>
                  {room.eliminated.includes(player.id) && (
                    <span style={{ fontSize: '12px', color: '#ef4444' }}>❌</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (room.votingPhase) {
    return <VotingPhase room={room} playerName={playerName} />;
  }

  return (
    <div className="container" style={{ minHeight: '100vh', paddingTop: '40px' }}>
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '24px',
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px'
        }}>
          <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>Round {room.currentRound}</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Room: {room.code}</p>
        </div>

        {isEliminated ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>You've been eliminated</h2>
            <p style={{ opacity: 0.8 }}>Wait for the game to finish...</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Your Secret</h2>
              <div style={{ 
                padding: '24px',
                background: 'rgba(102, 126, 234, 0.3)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>
                  Role: <strong>{playerRole}</strong>
                </div>
                {playerWord ? (
                  <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
                    {playerWord}
                  </div>
                ) : (
                  <div style={{ fontSize: '24px', fontWeight: 'bold', opacity: 0.7, marginBottom: '12px' }}>
                    No word - Blend in!
                  </div>
                )}
                {playerRole && <AIHint word={playerWord} role={playerRole} />}
              </div>
            </div>

            {isCurrentSpeaker && (
              <div style={{ 
                marginBottom: '32px',
                padding: '24px',
                background: 'rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                textAlign: 'center',
                border: '2px solid rgba(239, 68, 68, 0.5)'
              }}>
                <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>🎤 Your Turn to Speak</h2>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{timeLeft}s</div>
                <p style={{ marginBottom: '16px', opacity: 0.9 }}>
                  Describe your word without saying it directly!
                </p>
                <button onClick={handleEndSpeaking} className="btn btn-primary">
                  End Turn
                </button>
              </div>
            )}

            {!isCurrentSpeaker && room.speakingPhase && (
              <div style={{ 
                marginBottom: '32px',
                padding: '24px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Listening...</h2>
                <p style={{ opacity: 0.8 }}>
                  {room.players.find(p => p.id === room.currentSpeaker)?.name} is speaking
                </p>
                <div style={{ fontSize: '32px', marginTop: '16px' }}>{timeLeft}s</div>
              </div>
            )}

            <div>
              <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Players</h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                {room.players.map((player) => {
                  const isElim = room.eliminated.includes(player.id);
                  const isSpeaker = room.currentSpeaker === player.id;
                  return (
                    <div
                      key={player.id}
                      style={{
                        padding: '16px',
                        background: isElim
                          ? 'rgba(239, 68, 68, 0.2)'
                          : isSpeaker
                          ? 'rgba(102, 126, 234, 0.3)'
                          : 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        opacity: isElim ? 0.5 : 1
                      }}
                    >
                      <span>{player.name}</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {isSpeaker && <span>🎤</span>}
                        {isElim && <span>❌</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
