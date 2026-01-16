import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function generateWordPair(baseWord: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a word game assistant. Generate a word that is similar but different to the given word. The word should be related but distinct enough to create confusion in a social deduction game.'
        },
        {
          role: 'user',
          content: `Generate a word similar but different to "${baseWord}". Return only the word, nothing else.`
        }
      ],
      max_tokens: 20,
      temperature: 0.8,
    });

    return response.choices[0]?.message?.content?.trim() || baseWord;
  } catch (error) {
    console.error('AI error:', error);
    // Fallback to similar words from dataset
    return baseWord;
  }
}

export async function generateHint(word: string | null, role: string): Promise<string> {
  if (!word) {
    return 'You have no word. Blend in and try to figure out what others are describing.';
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a word game assistant. Generate a helpful hint for a player to describe their word without saying it directly.'
        },
        {
          role: 'user',
          content: `Generate a brief hint (one sentence) for a player to describe the word "${word}" without saying it directly. The player's role is ${role}.`
        }
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || `Describe "${word}" without saying it directly.`;
  } catch (error) {
    console.error('AI error:', error);
    return `Describe "${word}" without saying it directly.`;
  }
}
