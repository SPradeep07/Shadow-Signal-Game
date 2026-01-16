'use client';

import { useState } from 'react';
import { getSocket } from '@/lib/socket';
import { Room } from '@/types/game';

interface VotingPhaseProps {
  room: Room;
  playerName: string;
}

export default function VotingPhase({ room }: VotingPhaseProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const socket = getSocket();
  const currentPlayerId = socket?.id || null;
  const hasVoted = currentPlayerId ? !!room.votes[currentPlayerId] : false;
  const isEliminated = currentPlayerId ? room.eliminated.includes(currentPlayerId) : false;

  const activePlayers = room.players.filter(p => !room.eliminated.includes(p.id));

  const handleVote = (targetPlayerId: string) => {
    if (hasVoted || !socket || !currentPlayerId) return;
    setSelectedPlayer(targetPlayerId);
    socket.emit('vote', { roomCode: room.code, targetPlayerId });
  };

  if (isEliminated) {
    return (
      <div className="container" style={{ minHeight: '100vh', paddingTop: '40px' }}>
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>You've been eliminated</h2>
          <p style={{ opacity: 0.8 }}>Wait for voting to finish...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ minHeight: '100vh', paddingTop: '40px' }}>
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '8px', textAlign: 'center' }}>
          🗳️ Voting Phase
        </h1>
        <p style={{ textAlign: 'center', marginBottom: '32px', opacity: 0.9 }}>
          Vote for who you think is suspicious
        </p>

        {hasVoted ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            background: 'rgba(102, 126, 234, 0.2)',
            borderRadius: '8px',
            marginBottom: '32px'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>✅ Vote Submitted</h2>
            <p style={{ opacity: 0.8 }}>
              You voted for: <strong>{room.players.find(p => p.id === room.votes[currentPlayerId!])?.name}</strong>
            </p>
            <p style={{ marginTop: '16px', opacity: 0.7, fontSize: '14px' }}>
              Waiting for other players to vote... ({Object.keys(room.votes).length}/{activePlayers.length})
            </p>
          </div>
        ) : (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Select a player to vote out:</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {activePlayers
                .filter(p => p.id !== currentPlayerId)
                .map((player) => (
                  <button
                    key={player.id}
                    onClick={() => handleVote(player.id)}
                    className="btn"
                    style={{
                      width: '100%',
                      padding: '20px',
                      background: selectedPlayer === player.id
                        ? 'rgba(239, 68, 68, 0.3)'
                        : 'rgba(255, 255, 255, 0.1)',
                      textAlign: 'left',
                      border: selectedPlayer === player.id
                        ? '2px solid rgba(239, 68, 68, 0.5)'
                        : '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    {player.name}
                  </button>
                ))}
            </div>
          </div>
        )}

        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Voting Status</h2>
          <div style={{ display: 'grid', gap: '8px' }}>
            {activePlayers.map((player) => {
              const hasVotedForThis = Object.values(room.votes).includes(player.id);
              return (
                <div
                  key={player.id}
                  style={{
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{player.name}</span>
                  <span style={{ 
                    fontSize: '12px',
                    opacity: hasVotedForThis ? 1 : 0.5
                  }}>
                    {hasVotedForThis ? '✅ Voted' : '⏳ Waiting'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
