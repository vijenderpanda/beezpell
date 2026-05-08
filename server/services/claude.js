const axios = require('axios');

/**
 * Extract and analyze spelling words from a story using Claude AI.
 * If the API key isn't configured, falls back to intelligent local extraction.
 */
async function analyzeWords(words, grade, storyContext = "") {
  if (!process.env.CLAUDE_API_KEY || process.env.CLAUDE_API_KEY === 'your_anthropic_key_here') {
    console.warn('Claude API key missing, using local word analysis');
    return localWordAnalysis(words, grade);
  }

  const prompt = `
You are a literacy expert building a spelling app for Grade ${grade} children (age ${grade + 5}).

For each word below, return a JSON object with:
- word: the word (lowercase)
- tier: "easy" (3-4 letters, phonetic, common) | "medium" (5-7 letters, some patterns) | "hard" (8+ letters, complex spelling)
- difficulty_score: 0.0 to 1.0
- syllables: hyphenated (e.g. "el-e-phant")
- syllable_count: integer
- phonetic: child-readable pronunciation guide (e.g. "EL-eh-fant") — NOT IPA symbols
- vowel_positions: array of 0-indexed positions of vowel letters in the word
- consonant_positions: array of 0-indexed positions of consonant letters
- definition: one simple sentence appropriate for age ${grade + 5}
- example_sentence: a short sentence using the word, inspired by the story context below

Words to analyze: ${words.join(', ')}

Story context (use this for example sentences):
"""${storyContext.slice(0, 2000)}"""

Respond ONLY with a valid JSON array. No markdown fences, no preamble, no explanation.
`;

  try {
    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229',
      max_tokens: parseInt(process.env.MAX_AI_TOKENS) || 2000,
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    });

    const text = response.data.content[0].text.trim();
    // Handle if Claude wraps in markdown code fences
    const jsonStr = text.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
    const parsed = JSON.parse(jsonStr);

    // Add reverse_word if not present
    return parsed.map(w => ({
      ...w,
      reverse_word: w.reverse_word || w.word.split('').reverse().join('')
    }));
  } catch (err) {
    console.error('Claude API Error:', err.response?.data || err.message);
    console.warn('Falling back to local analysis');
    return localWordAnalysis(words, grade);
  }
}

/**
 * Extract the best candidate spelling words from a story text.
 * Uses frequency, length, and pattern analysis to pick words worth learning.
 */
function extractSpellingWords(fullText, grade) {
  const text = fullText.toLowerCase();
  
  // Common stop words to skip
  const stopWords = new Set([
    'the', 'and', 'was', 'for', 'are', 'but', 'not', 'you', 'all', 'can',
    'had', 'her', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
    'how', 'its', 'may', 'new', 'now', 'old', 'see', 'way', 'who', 'did',
    'got', 'let', 'say', 'she', 'too', 'use', 'with', 'have', 'from',
    'they', 'been', 'said', 'each', 'this', 'that', 'what', 'were', 'when',
    'will', 'more', 'into', 'very', 'just', 'than', 'them', 'then', 'some',
    'also', 'after', 'before', 'other', 'about', 'could', 'would', 'should',
    'their', 'there', 'which', 'these', 'those', 'being', 'where', 'because',
    'through', 'still', 'much', 'back', 'here', 'only', 'come', 'made',
    'well', 'over', 'such', 'take', 'long', 'most', 'like', 'make', 'many',
    'went', 'came', 'upon', 'little', 'every', 'does', 'don', 'didn',
  ]);

  // Extract all words
  const allWords = text.match(/\b[a-z]+\b/g) || [];
  
  // Count frequency
  const freq = {};
  allWords.forEach(w => {
    if (w.length >= 3 && !stopWords.has(w)) {
      freq[w] = (freq[w] || 0) + 1;
    }
  });

  // Score words based on spelling value
  const scored = Object.entries(freq).map(([word, count]) => {
    let score = 0;
    
    // Length-based score (sweet spot: 4-10 letters)
    if (word.length >= 4 && word.length <= 6) score += 3;
    else if (word.length >= 7 && word.length <= 10) score += 5;
    else if (word.length > 10) score += 4;
    else score += 1;

    // Pattern complexity bonuses
    if (/[aeiou]{2}/.test(word)) score += 2;  // Double vowels (ea, ou, ai)
    if (/([a-z])\1/.test(word)) score += 2;   // Double letters (ll, ss, tt)
    if (/tion|sion|ness|ment|able|ible/.test(word)) score += 3; // Suffixes
    if (/ph|gh|wr|kn|wh|ch|sh|th/.test(word)) score += 2; // Digraphs
    if (/ight|ough|ould/.test(word)) score += 3; // Complex patterns
    
    // Frequency bonus (words that appear 2-3 times are good candidates)
    if (count >= 2 && count <= 4) score += 2;
    
    // Grade adjustment
    if (grade <= 2 && word.length > 8) score -= 3;
    if (grade >= 4 && word.length <= 3) score -= 2;

    return { word, score, count };
  });

  // Sort by score descending, take top words
  scored.sort((a, b) => b.score - a.score);
  
  // Aim for ~15 easy, ~15 medium, ~15 hard
  const maxWords = 45;
  const selected = scored.slice(0, maxWords).map(s => s.word);
  
  return selected;
}

/**
 * Local fallback word analysis when Claude API is unavailable.
 * Produces reasonable tier assignments and mock linguistic data.
 */
function localWordAnalysis(words, grade) {
  const vowels = 'aeiou';
  
  return words.map(word => {
    const len = word.length;
    let tier = 'medium';
    let difficulty = 0.5;

    // Tier assignment based on length + pattern complexity
    const hasDigraphs = /ph|gh|wr|kn|wh|ch|sh|th/.test(word);
    const hasDoubleVowel = /[aeiou]{2}/.test(word);
    const hasSuffix = /tion|sion|ness|ment|able|ible|ful|less|ous|ive/.test(word);

    if (len <= 4 && !hasDigraphs) {
      tier = 'easy'; difficulty = 0.2 + Math.random() * 0.2;
    } else if (len <= 7 && !hasSuffix) {
      tier = 'medium'; difficulty = 0.4 + Math.random() * 0.2;
    } else {
      tier = 'hard'; difficulty = 0.7 + Math.random() * 0.2;
    }

    // Simple syllable estimation
    const syllableMatches = word.match(/[aeiou]+/gi) || [''];
    const syllableCount = Math.max(1, syllableMatches.length);
    const syllables = [];
    let remaining = word;
    for (let i = 0; i < syllableCount && remaining.length > 0; i++) {
      const chunkSize = Math.ceil(remaining.length / (syllableCount - i));
      syllables.push(remaining.slice(0, chunkSize));
      remaining = remaining.slice(chunkSize);
    }

    const vowelPositions = [];
    const consonantPositions = [];
    word.split('').forEach((c, i) => {
      if (vowels.includes(c.toLowerCase())) vowelPositions.push(i);
      else consonantPositions.push(i);
    });

    return {
      word,
      tier,
      difficulty_score: Math.round(difficulty * 100) / 100,
      syllables: syllables.join('-'),
      syllable_count: syllableCount,
      phonetic: syllables.map(s => s.toUpperCase()).join('-'),
      vowel_positions: vowelPositions,
      consonant_positions: consonantPositions,
      definition: `A word from the story meaning something related to ${word}.`,
      example_sentence: `Can you spell the word "${word}"?`,
      reverse_word: word.split('').reverse().join('')
    };
  });
}

module.exports = { analyzeWords, extractSpellingWords };
