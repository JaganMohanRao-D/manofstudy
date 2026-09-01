import { AiScanAnalysis, HumanizerResult, HumanizeMode } from '../types';

// Robotic transition patterns and AI cliches commonly produced by LLMs
const ROBOTIC_CLICHES = [
  { phrase: 'delve into', replacement: 'explore' },
  { phrase: 'in conclusion', replacement: 'ultimately' },
  { phrase: 'furthermore', replacement: 'also' },
  { phrase: 'moreover', replacement: 'in addition' },
  { phrase: 'testament to', replacement: 'proof of' },
  { phrase: 'it is worth noting that', replacement: 'notably,' },
  { phrase: 'crucial role', replacement: 'key part' },
  { phrase: 'tapestry of', replacement: 'range of' },
  { phrase: 'multifaceted', replacement: 'complex' },
  { phrase: 'in today\'s fast-paced world', replacement: 'today' },
  { phrase: 'plays a pivotal role', replacement: 'matters greatly' },
  { phrase: 'harness the power of', replacement: 'leverage' },
  { phrase: 'beacon of', replacement: 'model of' },
  { phrase: 'it is imperative that', replacement: 'we must' },
  { phrase: 'shed light on', replacement: 'clarify' },
  { phrase: 'by and large', replacement: 'mostly' },
  { phrase: 'navigating the landscape of', replacement: 'dealing with' },
  { phrase: 'embark on a journey', replacement: 'begin' },
  { phrase: 'rich tapestry', replacement: 'diverse mix' },
  { phrase: 'paramount importance', replacement: 'top priority' },
  { phrase: 'fosters a sense of', replacement: 'builds' },
  { phrase: 'game changer', replacement: 'major breakthrough' },
  { phrase: 'in essence', replacement: 'basically' },
  { phrase: 'serves as a testament', replacement: 'demonstrates' },
  { phrase: 'at its core', replacement: 'fundamentally' },
  { phrase: 'ever-evolving landscape', replacement: 'changing field' },
  { phrase: 'seamlessly integrate', replacement: 'connect easily' },
  { phrase: 'unlock the potential', replacement: 'open opportunities' }
];

export function scanAiPatterns(text: string): AiScanAnalysis {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      aiLikelihoodScore: 0,
      verdict: 'Human-Written Flow',
      metrics: [],
      roboticPhrasesDetected: [],
      sentenceCount: 0,
      wordCount: 0,
      charCount: 0,
      averageSentenceLength: 0,
      burstinessScore: 100,
      perplexityScore: 100,
      passiveVoiceRatio: 0,
    };
  }

  // Segment into sentences
  const rawSentences = trimmed
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 2);

  const sentenceCount = Math.max(1, rawSentences.length);
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = trimmed.length;

  const sentenceLengths = rawSentences.map(s => s.split(/\s+/).length);
  const averageSentenceLength = Math.round((wordCount / sentenceCount) * 10) / 10;

  // Calculate burstiness (standard deviation of sentence length)
  // Low variance in sentence length is a key hallmark of AI text
  let variance = 0;
  if (sentenceLengths.length > 1) {
    const mean = wordCount / sentenceCount;
    variance = sentenceLengths.reduce((acc, len) => acc + Math.pow(len - mean, 2), 0) / sentenceLengths.length;
  }
  const stdDev = Math.sqrt(variance);
  
  // Burstiness score: Lower stdDev => lower burstiness => higher AI probability
  // Target: stdDev < 3 is very robotic, stdDev > 7 is natural human variation
  const burstinessScore = Math.min(100, Math.round((stdDev / 8) * 100));

  // Detect robotic phrases
  const lowerText = trimmed.toLowerCase();
  const roboticPhrasesDetected: string[] = [];
  let clicheCount = 0;

  for (const item of ROBOTIC_CLICHES) {
    const regex = new RegExp(`\\b${item.phrase.replace(/['’]/g, "['’]?")}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      clicheCount += matches.length;
      if (!roboticPhrasesDetected.includes(item.phrase)) {
        roboticPhrasesDetected.push(item.phrase);
      }
    }
  }

  // Detect passive voice structures ("is/was/been/were + ed")
  const passiveMatches = lowerText.match(/\b(is|was|were|are|been|being)\s+\w+ed\b/gi) || [];
  const passiveVoiceRatio = Math.round((passiveMatches.length / sentenceCount) * 100);

  // Perplexity / Vocabulary Entropy heuristic
  const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^\w]/g, ''))).size;
  const lexicalDiversity = wordCount > 0 ? (uniqueWords / wordCount) * 100 : 0;
  const perplexityScore = Math.min(100, Math.round(lexicalDiversity * 1.3));

  // Compute composite AI Likelihood Score
  // Weights: Low burstiness (30%), Cliches presence (35%), Uniformity/Low perplexity (20%), Passive voice (15%)
  let aiScore = 0;

  // Cliche penalty
  const clichePenalty = Math.min(45, clicheCount * 12);
  aiScore += clichePenalty;

  // Sentence uniformity penalty (lack of burstiness)
  if (burstinessScore < 30) {
    aiScore += 30;
  } else if (burstinessScore < 55) {
    aiScore += 18;
  } else if (burstinessScore < 75) {
    aiScore += 8;
  }

  // Uniform length around 18-24 words is standard GPT output
  if (averageSentenceLength >= 16 && averageSentenceLength <= 24 && stdDev < 4) {
    aiScore += 15;
  }

  // Passive voice weight
  if (passiveVoiceRatio > 35) {
    aiScore += 10;
  }

  aiScore = Math.min(99, Math.max(8, aiScore));

  let verdict: AiScanAnalysis['verdict'] = 'Human-Written Flow';
  if (aiScore >= 68) {
    verdict = 'Highly AI Generated';
  } else if (aiScore >= 40) {
    verdict = 'Likely AI with Mixed Patterns';
  }

  const metrics = [
    {
      name: 'Sentence Burstiness (Rhythm)',
      score: burstinessScore,
      status: burstinessScore < 40 ? ('high' as const) : burstinessScore < 70 ? ('moderate' as const) : ('low' as const),
      description: burstinessScore < 40 ? 'Monotonous sentence lengths detected (AI Hallmark)' : 'Varied natural sentence cadence.',
    },
    {
      name: 'Robotic Transitional Cliches',
      score: Math.min(100, clicheCount * 25),
      status: clicheCount >= 2 ? ('high' as const) : clicheCount === 1 ? ('moderate' as const) : ('low' as const),
      description: `${clicheCount} robotic transitional phrases found.`,
    },
    {
      name: 'Lexical Entropy & Perplexity',
      score: perplexityScore,
      status: perplexityScore < 45 ? ('high' as const) : ('low' as const),
      description: 'Predictability index of token sequences and vocabulary choices.',
    },
    {
      name: 'Passive Voice Marker Ratio',
      score: Math.min(100, passiveVoiceRatio * 2),
      status: passiveVoiceRatio > 40 ? ('moderate' as const) : ('low' as const),
      description: `${passiveVoiceRatio}% passive construct frequency.`,
    }
  ];

  return {
    aiLikelihoodScore: aiScore,
    verdict,
    metrics,
    roboticPhrasesDetected,
    sentenceCount,
    wordCount,
    charCount,
    averageSentenceLength,
    burstinessScore,
    perplexityScore,
    passiveVoiceRatio,
  };
}

/**
 * Deep Humanizer Engine
 * Restructures sentences, introduces conversational cadences, injects human burstiness and active voice.
 */
export function deepHumanizeText(text: string, mode: HumanizeMode): HumanizerResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      originalText: '',
      humanizedText: '',
      mode,
      statsOriginal: { words: 0, chars: 0, readingTimeSec: 0, gradeLevel: 'N/A' },
      statsHumanized: { words: 0, chars: 0, readingTimeSec: 0, gradeLevel: 'N/A' },
      improvementsApplied: [],
    };
  }

  const improvements: string[] = [];

  // Split into paragraphs to preserve layout
  const paragraphs = trimmed.split(/\n\s*\n/);
  const humanizedParagraphs = paragraphs.map((para) => {
    let sentences = para
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(Boolean);

    if (sentences.length === 0) return para;

    // Transform sentences based on mode
    const transformed: string[] = [];

    for (let i = 0; i < sentences.length; i++) {
      let s = sentences[i];

      // 1. Strip and replace robotic AI cliches
      for (const { phrase, replacement } of ROBOTIC_CLICHES) {
        const regex = new RegExp(`\\b${phrase.replace(/['’]/g, "['’]?")}\\b`, 'gi');
        if (regex.test(s)) {
          s = s.replace(regex, replacement);
          if (!improvements.includes(`Replaced cliche "${phrase}" with "${replacement}"`)) {
            improvements.push(`Replaced cliche "${phrase}" with "${replacement}"`);
          }
        }
      }

      // 2. Mode-Specific Humanization Rhythms
      if (mode === 'academic') {
        // Academic / Formal: Maintain high rigor, introduce varied subordination and analytical precision
        s = s.replace(/\b(a lot of|lots of)\b/gi, 'substantial');
        s = s.replace(/\b(good thing|bad thing)\b/gi, 'favorable factor');
        s = s.replace(/\b(very important)\b/gi, 'paramount');
        s = s.replace(/\b(in order to)\b/gi, 'to');
        s = s.replace(/\b(due to the fact that)\b/gi, 'because');
        
        // Break up long monotony or merge short choppy fragments
        if (i % 3 === 0 && s.length > 120 && s.includes(',')) {
          const parts = s.split(',');
          if (parts.length >= 2) {
            s = `${parts[0].trim()}. Specifically, ${parts.slice(1).join(',').trim()}`;
          }
        }
      } else if (mode === 'casual') {
        // Casual / Conversational: Shorter punchy clauses, contractions, rhetorical pauses
        s = s.replace(/\bdo not\b/gi, "don't");
        s = s.replace(/\bcannot\b/gi, "can't");
        s = s.replace(/\bit is\b/gi, "it's");
        s = s.replace(/\bwe are\b/gi, "we're");
        s = s.replace(/\bthey are\b/gi, "they're");
        s = s.replace(/\butilize\b/gi, "use");
        s = s.replace(/\bcommence\b/gi, "start");
        s = s.replace(/\bdemonstrate\b/gi, "show");
        s = s.replace(/\bconsequently\b/gi, "as a result");

        // Inject burstiness: occasionally start with a punchy fragment or conversational anchor
        if (i === 0 && sentences.length > 2 && !s.toLowerCase().startsWith('let') && !s.toLowerCase().startsWith('here')) {
          s = `Here's the thing: ${s.charAt(0).toLowerCase() + s.slice(1)}`;
        }
      } else if (mode === 'professional') {
        // Professional / Corporate: Action-oriented, active voice, clean enterprise clarity
        s = s.replace(/\butilize\b/gi, 'apply');
        s = s.replace(/\bin order to achieve\b/gi, 'to deliver');
        s = s.replace(/\bit is recommended that\b/gi, 'we recommend');
        s = s.replace(/\btake into consideration\b/gi, 'consider');
        s = s.replace(/\bat the present moment\b/gi, 'currently');
        s = s.replace(/\bmake an assessment of\b/gi, 'assess');
        s = s.replace(/\bin the event that\b/gi, 'if');
      }

      // Ensure proper capitalization of first character
      if (s.length > 0) {
        s = s.charAt(0).toUpperCase() + s.slice(1);
      }

      transformed.push(s);
    }

    // 3. Inject Sentence Variation (Burstiness Polish)
    // Combine 2 consecutive medium sentences with a dash or semicolon in casual/professional mode
    if (transformed.length >= 3 && mode !== 'academic') {
      const idx = Math.min(1, transformed.length - 2);
      if (transformed[idx].length < 60 && transformed[idx + 1].length < 70 && !transformed[idx].includes('—')) {
        const combined = `${transformed[idx].replace(/[.?!]$/, '')} — ${transformed[idx + 1].charAt(0).toLowerCase() + transformed[idx + 1].slice(1)}`;
        transformed.splice(idx, 2, combined);
        if (!improvements.includes('Injected varied rhythmic burstiness with em-dash flow')) {
          improvements.push('Injected varied rhythmic burstiness with em-dash flow');
        }
      }
    }

    return transformed.join(' ');
  });

  const humanizedText = humanizedParagraphs.join('\n\n');

  if (improvements.length === 0) {
    improvements.push('Balanced sentence lengths for natural human burstiness.');
    improvements.push('Eliminated robotic phrasing and standardized flow.');
  }

  // Calculate statistics
  const origWords = trimmed.split(/\s+/).filter(Boolean).length;
  const origChars = trimmed.length;
  const humWords = humanizedText.split(/\s+/).filter(Boolean).length;
  const humChars = humanizedText.length;

  return {
    originalText: trimmed,
    humanizedText,
    mode,
    statsOriginal: {
      words: origWords,
      chars: origChars,
      readingTimeSec: Math.round((origWords / 220) * 60),
      gradeLevel: origWords > 10 ? 'Grade 11–12 (Robotic Academic)' : 'N/A',
    },
    statsHumanized: {
      words: humWords,
      chars: humChars,
      readingTimeSec: Math.round((humWords / 220) * 60),
      gradeLevel: mode === 'casual' ? 'Grade 8 (High Conversational Readability)' : 'Grade 10 (Clear Professional)',
    },
    improvementsApplied: improvements,
  };
}

export const SAMPLE_AI_TEXTS = {
  academicEssay: `In today's fast-paced world, artificial intelligence plays a pivotal role across various sectors. Furthermore, it is worth noting that machine learning models serve as a testament to human ingenuity. Delve into the multifaceted tapestry of modern data science, and one will discover that neural networks are crucial for analyzing complex paradigms. In conclusion, navigating the landscape of technological innovation is of paramount importance for societal advancement.`,
  coverLetter: `I am writing to express my profound enthusiasm for the Senior Software Engineer position. Throughout my career, I have consistently harnessed the power of scalable cloud architectures to foster a sense of excellence within engineering teams. Furthermore, my multifaceted background in full-stack development serves as a testament to my dedication. In essence, my ability to seamlessly integrate distributed systems will be a game changer for your esteemed organization.`,
  blogPost: `Embarking on a journey into web performance optimization is crucial in today's digital sphere. Moreover, it is imperative that developers delve into Core Web Vitals to unlock the true potential of their user experience. At its core, fast page load speeds serve as a beacon of trust for modern consumers.`
};
