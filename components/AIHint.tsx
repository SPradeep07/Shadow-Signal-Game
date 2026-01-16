'use client';

import { useState, useEffect } from 'react';

interface AIHintProps {
  word: string | null;
  role: string;
}

export default function AIHint({ word, role }: AIHintProps) {
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (word !== undefined && role && !hint && !loading) {
      setLoading(true);
      fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'generateHint', word, role })
      })
        .then(res => res.json())
        .then(data => {
          setHint(data.hint);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [word, role, hint, loading]);

  if (!word && role === 'infiltrator') {
    return (
      <div style={{ 
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        fontSize: '14px',
        fontStyle: 'italic',
        opacity: 0.9
      }}>
        💡 You have no word. Blend in and try to figure out what others are describing.
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ 
        marginTop: '16px',
        fontSize: '14px',
        opacity: 0.7
      }}>
        Generating hint...
      </div>
    );
  }

  if (hint) {
    return (
      <div style={{ 
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        fontSize: '14px',
        fontStyle: 'italic',
        opacity: 0.9
      }}>
        💡 {hint}
      </div>
    );
  }

  return null;
}
