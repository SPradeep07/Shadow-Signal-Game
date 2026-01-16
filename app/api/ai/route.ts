import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { type, word, role } = await request.json();

    if (type === 'generateWordPair') {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a word game assistant. Generate a word that is similar but different to the given word. The word should be related but distinct enough to create confusion in a social deduction game. Return only the word, nothing else.'
          },
          {
            role: 'user',
            content: `Generate a word similar but different to "${word}". Return only the word, nothing else.`
          }
        ],
        max_tokens: 20,
        temperature: 0.8,
      });

      return NextResponse.json({ 
        word: response.choices[0]?.message?.content?.trim() || word 
      });
    }

    if (type === 'generateHint') {
      if (!word) {
        return NextResponse.json({ 
          hint: 'You have no word. Blend in and try to figure out what others are describing.' 
        });
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a word game assistant. Generate a helpful hint for a player to describe their word without saying it directly. Keep it to one sentence.'
          },
          {
            role: 'user',
            content: `Generate a brief hint (one sentence) for a player to describe the word "${word}" without saying it directly. The player's role is ${role}.`
          }
        ],
        max_tokens: 50,
        temperature: 0.7,
      });

      return NextResponse.json({ 
        hint: response.choices[0]?.message?.content?.trim() || `Describe "${word}" without saying it directly.` 
      });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 500 });
  }
}
