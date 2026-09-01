import { AtsScoreResult, KeywordItem, AtsDiagnosticFinding, AtsResumeStructured } from '../types';
import jsPDF from 'jspdf';

const COMMON_STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could',
  'did', 'do', 'does', 'doing', 'don', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has',
  'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into',
  'is', 'isn', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'must', 'my', 'myself', 'no', 'nor', 'not',
  'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same',
  'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then',
  'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn',
  'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your',
  'yours', 'yourself', 'yourselves', 'will', 'shall', 'may', 'might', 'must', 'need', 'needs', 'want', 'wants',
  'looking', 'role', 'job', 'position', 'candidate', 'experience', 'years', 'plus', 'preferred', 'required',
  'responsibility', 'responsibilities', 'opportunity', 'company', 'work', 'working', 'ability', 'able', 'etc',
  'including', 'across', 'well', 'help', 'make', 'good', 'strong', 'great', 'ideal', 'apply', 'joining', 'join'
]);

const KNOWN_TECH_KEYWORDS = new Set([
  'react', 'react.js', 'reactjs', 'typescript', 'javascript', 'python', 'java', 'c++', 'c#', 'golang', 'go', 'rust',
  'node', 'node.js', 'nodejs', 'express', 'express.js', 'next.js', 'nextjs', 'vue', 'vue.js', 'angular',
  'html', 'html5', 'css', 'css3', 'tailwind', 'tailwindcss', 'sass', 'bootstrap', 'webpack', 'vite',
  'docker', 'kubernetes', 'k8s', 'aws', 'amazon web services', 'gcp', 'google cloud', 'azure', 'ci/cd', 'github actions',
  'jenkins', 'terraform', 'ansible', 'linux', 'bash', 'shell', 'git', 'github', 'gitlab', 'bitbucket',
  'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'dynamodb', 'sql', 'nosql',
  'graphql', 'rest', 'restful', 'api', 'apis', 'grpc', 'microservices', 'serverless', 'lambda',
  'kafka', 'rabbitmq', 'pubsub', 'spark', 'hadoop', 'pandas', 'numpy', 'scipy', 'pytorch', 'tensorflow', 'keras',
  'machine learning', 'deep learning', 'nlp', 'llm', 'generative ai', 'computer vision', 'data science', 'ai',
  'unit testing', 'jest', 'cypress', 'playwright', 'selenium', 'mocha', 'chai', 'tdd', 'bdd',
  'agile', 'scrum', 'kanban', 'jira', 'confluence', 'figma', 'postman', 'swagger', 'oauth', 'jwt',
  'system design', 'distributed systems', 'data structures', 'algorithms', 'object-oriented', 'oop', 'solid principles',
  'clean code', 'design patterns', 'frontend', 'backend', 'fullstack', 'full-stack', 'devops', 'sre', 'ci/cd pipeline'
]);

const SOFT_SKILLS = new Set([
  'communication', 'collaboration', 'problem solving', 'critical thinking', 'leadership', 'time management',
  'adaptability', 'mentorship', 'cross-functional', 'stakeholder management', 'presentation', 'team player',
  'troubleshooting', 'analytical skills', 'attention to detail', 'multitasking', 'decision making'
]);

const TOOLS_PLATFORMS = new Set([
  'jira', 'confluence', 'git', 'github', 'gitlab', 'docker', 'kubernetes', 'postman', 'figma', 'notion', 'slack',
  'aws', 'azure', 'gcp', 'jenkins', 'circleci', 'datadog', 'grafana', 'prometheus', 'sentry', 'linux', 'macos'
]);

export const WEAK_ACTION_VERBS = [
  'worked on', 'helped with', 'assisted', 'responsible for', 'handled', 'did', 'was involved in',
  'participated in', 'tried to', 'tasked with', 'duties included', 'was responsible for', 'managed to'
];

export const POWER_ACTION_VERBS = [
  'Architected', 'Engineered', 'Optimized', 'Spearheaded', 'Automated', 'Delivered', 'Scaled',
  'Formulated', 'Accelerated', 'Implemented', 'Revamped', 'Reduced', 'Increased', 'Pioneered'
];

export function cleanText(text: string): string {
  return text.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function extractTokensAndPhrases(text: string): { words: string[]; rawCount: number } {
  const cleaned = cleanText(text);
  if (!cleaned) return { words: [], rawCount: 0 };

  const rawWords = cleaned.split(/\s+/);
  const rawCount = rawWords.length;

  return { words: rawWords, rawCount };
}

/**
 * Intelligent ATS Diagnostics & Keyword Matcher
 */
export function analyzeAtsMatch(resumeText: string, jdText: string): AtsScoreResult {
  const cleanedResume = resumeText.toLowerCase();
  const cleanedJd = jdText.toLowerCase();

  const { rawCount: resumeWordCount } = extractTokensAndPhrases(resumeText);
  const { rawCount: jdWordCount } = extractTokensAndPhrases(jdText);

  // Diagnostics lists
  const findings: AtsDiagnosticFinding[] = [];
  const formattingFlags: string[] = [];

  if (!cleanedResume || !cleanedJd) {
    return {
      matchPercentage: 0,
      totalJdKeywords: 0,
      matchedCount: 0,
      missingCount: 0,
      matchedKeywords: [],
      missingKeywords: [],
      resumeWordCount,
      jdWordCount,
      criticalMissingCount: 0,
      weakVerbsCount: 0,
      quantifiableMetricsCount: 0,
      formattingFlags: [],
      findings: [],
      categoryScores: {
        technical: { matched: 0, total: 0, percent: 0 },
        tools: { matched: 0, total: 0, percent: 0 },
        soft_skills: { matched: 0, total: 0, percent: 0 },
        general: { matched: 0, total: 0, percent: 0 },
      },
    };
  }

  // 1. Diagnostics: Check Weak Action Verbs
  let weakVerbsCount = 0;
  for (const verb of WEAK_ACTION_VERBS) {
    const regex = new RegExp(`\\b${verb}\\b`, 'gi');
    const matches = resumeText.match(regex);
    if (matches && matches.length > 0) {
      weakVerbsCount += matches.length;
      findings.push({
        type: 'grammar',
        severity: 'warning',
        title: `Passive / Weak Phrasing: "${verb}"`,
        message: `Found ${matches.length} instance(s) of weak phrasing that reduces recruiter impact.`,
        snippet: verb,
        suggestion: `Replace with high-impact power action verbs like "Spearheaded", "Architected", or "Engineered".`,
      });
    }
  }

  // 2. Diagnostics: Quantifiable Metrics Check (% numbers, $, ms, multipliers)
  const metricRegex = /\b(\d+[\d,.]*\s*(%|percent|users|rpm|qps|ms|seconds|x|k|m|million|billion|\$|gb|tb|hours|days|weeks|fte))\b/gi;
  const numberMatches = resumeText.match(metricRegex) || [];
  const quantifiableMetricsCount = numberMatches.length;

  if (quantifiableMetricsCount < 3) {
    findings.push({
      type: 'metric',
      severity: 'critical',
      title: 'Low Quantifiable Business Impact',
      message: `Only detected ${quantifiableMetricsCount} numerical metrics in your resume bullets.`,
      suggestion: 'ATS algorithms & hiring managers favor bullets with the XYZ formula: "Accomplished [X] as measured by [Y] by doing [Z]". Add latency drops, % improvements, or user counts.',
    });
  } else {
    findings.push({
      type: 'metric',
      severity: 'good',
      title: 'Strong Quantifiable Impact',
      message: `Detected ${quantifiableMetricsCount} impact metrics (percentages, user counts, performance multipliers).`,
      suggestion: 'Great job quantifying results. Keep every bullet metric-grounded.',
    });
  }

  // 3. Diagnostics: Formatting and Structure Red Flags
  if (resumeWordCount < 150) {
    formattingFlags.push('Resume word count is under 150 words (likely incomplete).');
    findings.push({
      type: 'structure',
      severity: 'critical',
      title: 'Insufficient Content Length',
      message: `Your resume is only ${resumeWordCount} words. Standard single-page ATS resumes are between 350 and 650 words.`,
      suggestion: 'Elaborate on your project implementations, architectural decisions, and responsibilities.',
    });
  } else if (resumeWordCount > 950) {
    formattingFlags.push('Resume exceeds 950 words (risk of 2+ page spillover).');
    findings.push({
      type: 'structure',
      severity: 'warning',
      title: 'High Word Count / Length Warning',
      message: `At ${resumeWordCount} words, your resume may exceed a single page.`,
      suggestion: 'Condense verbose bullet points into crisp, single-line achievements.',
    });
  }

  // Check section headers presence
  const hasExpHeader = /experience|work history|employment/i.test(resumeText);
  const hasSkillsHeader = /skills|technical stack|competencies/i.test(resumeText);
  const hasEduHeader = /education|academic|university|degree/i.test(resumeText);
  const hasProjectHeader = /projects|portfolio|personal projects/i.test(resumeText);

  if (!hasExpHeader && !hasProjectHeader) {
    formattingFlags.push('Missing explicit "Experience" or "Projects" header.');
    findings.push({
      type: 'structure',
      severity: 'critical',
      title: 'Missing Experience / Projects Section',
      message: 'ATS scanners search for standard section headers to parse chronology.',
      suggestion: 'Add clear bold headers: "WORK EXPERIENCE" and "PROJECTS".',
    });
  }

  if (!hasSkillsHeader) {
    formattingFlags.push('Missing explicit "Technical Skills" header.');
    findings.push({
      type: 'structure',
      severity: 'warning',
      title: 'Missing Dedicated Skills Section',
      message: 'ATS parsers use dedicated skills blocks for fast keyword extraction.',
      suggestion: 'Include a "TECHNICAL SKILLS" section near the top or bottom of your resume.',
    });
  }

  // Contact info check
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/i.test(resumeText);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText);
  const hasGithubOrLinkedin = /(github\.com|linkedin\.com)/i.test(resumeText);

  if (!hasEmail || !hasPhone) {
    formattingFlags.push('Missing or obscured Email Address or Phone Number in header.');
    findings.push({
      type: 'grammar',
      severity: 'critical',
      title: 'Missing Standard Contact Info',
      message: 'Recruiters and automated ATS parsing requires email and phone number.',
      suggestion: 'Ensure your Email and Phone Number appear cleanly in the first 3 lines of your resume.',
    });
  }

  // 4. Keyword Extraction & Similarity
  const candidatePhrases: Map<string, number> = new Map();
  const allKnownPhrases = [...KNOWN_TECH_KEYWORDS, ...SOFT_SKILLS, ...TOOLS_PLATFORMS];

  for (const phrase of allKnownPhrases) {
    const escaped = phrase.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matchesInJd = (cleanedJd.match(regex) || []).length;
    if (matchesInJd > 0) {
      candidatePhrases.set(phrase, matchesInJd);
    }
  }

  const jdWordsOnly = cleanedJd
    .replace(/[^\w\s+#.-]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim().replace(/^[-.]+|[-.]+$/g, ''))
    .filter(w => w.length > 1 && !COMMON_STOP_WORDS.has(w) && !/^\d+$/.test(w));

  const wordFrequencyInJd: Map<string, number> = new Map();
  for (const word of jdWordsOnly) {
    wordFrequencyInJd.set(word, (wordFrequencyInJd.get(word) || 0) + 1);
  }

  const finalKeywordsMap: Map<string, { freqInJd: number; category: KeywordItem['category']; importance: KeywordItem['importance'] }> = new Map();

  for (const [phrase, freq] of candidatePhrases.entries()) {
    let category: KeywordItem['category'] = 'general';
    if (KNOWN_TECH_KEYWORDS.has(phrase)) category = 'technical';
    else if (TOOLS_PLATFORMS.has(phrase)) category = 'tools';
    else if (SOFT_SKILLS.has(phrase)) category = 'soft_skills';

    const importance: KeywordItem['importance'] = (freq >= 2 || category === 'technical') ? 'critical' : 'recommended';
    finalKeywordsMap.set(phrase, { freqInJd: freq, category, importance });
  }

  for (const [word, freq] of wordFrequencyInJd.entries()) {
    let isSubword = false;
    for (const phrase of candidatePhrases.keys()) {
      if (phrase.includes(' ') && phrase.split(' ').includes(word)) {
        isSubword = true;
        break;
      }
    }

    if (!isSubword || freq > 2) {
      let category: KeywordItem['category'] = 'general';
      if (KNOWN_TECH_KEYWORDS.has(word)) category = 'technical';
      else if (TOOLS_PLATFORMS.has(word)) category = 'tools';
      else if (SOFT_SKILLS.has(word)) category = 'soft_skills';

      const importance: KeywordItem['importance'] = 
        category === 'technical' || freq >= 3 ? 'critical' : (freq >= 2 ? 'recommended' : 'optional');

      finalKeywordsMap.set(word, { freqInJd: freq, category, importance });
    }
  }

  const matchedKeywords: KeywordItem[] = [];
  const missingKeywords: KeywordItem[] = [];

  let weightedScoreSum = 0;
  let maxPossibleScore = 0;

  const categoryTotals = {
    technical: { matched: 0, total: 0 },
    tools: { matched: 0, total: 0 },
    soft_skills: { matched: 0, total: 0 },
    general: { matched: 0, total: 0 },
  };

  for (const [keyword, meta] of finalKeywordsMap.entries()) {
    const escaped = keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matchesInResume = (cleanedResume.match(regex) || []).length;
    const isMatched = matchesInResume > 0;

    const weightMultiplier = 
      meta.importance === 'critical' ? 3.0 : 
      meta.importance === 'recommended' ? 1.8 : 1.0;

    const termScore = meta.freqInJd * weightMultiplier;
    maxPossibleScore += termScore;

    categoryTotals[meta.category].total += 1;

    const item: KeywordItem = {
      word: keyword,
      frequencyInJd: meta.freqInJd,
      frequencyInResume: matchesInResume,
      isMatched,
      importance: meta.importance,
      category: meta.category,
    };

    if (isMatched) {
      weightedScoreSum += termScore;
      matchedKeywords.push(item);
      categoryTotals[meta.category].matched += 1;
    } else {
      missingKeywords.push(item);
    }
  }

  const sortComparator = (a: KeywordItem, b: KeywordItem) => {
    const impRank = { critical: 3, recommended: 2, optional: 1 };
    if (impRank[b.importance] !== impRank[a.importance]) {
      return impRank[b.importance] - impRank[a.importance];
    }
    return b.frequencyInJd - a.frequencyInJd;
  };

  matchedKeywords.sort(sortComparator);
  missingKeywords.sort(sortComparator);

  const rawPercent = maxPossibleScore > 0 ? (weightedScoreSum / maxPossibleScore) * 100 : 0;
  const matchPercentage = Math.min(100, Math.max(0, Math.round(rawPercent)));
  const criticalMissingCount = missingKeywords.filter(k => k.importance === 'critical').length;

  if (criticalMissingCount > 0) {
    const topMissing = missingKeywords.slice(0, 4).map(k => `"${k.word}"`).join(', ');
    findings.push({
      type: 'skill',
      severity: 'critical',
      title: `${criticalMissingCount} Critical Technical Keywords Missing`,
      message: `The job posting heavily requires skills like ${topMissing} which are absent from your resume.`,
      suggestion: `Incorporate these missing keywords into your Skills, Experience, or Project bullets.`,
    });
  }

  return {
    matchPercentage,
    totalJdKeywords: finalKeywordsMap.size,
    matchedCount: matchedKeywords.length,
    missingCount: missingKeywords.length,
    matchedKeywords,
    missingKeywords,
    resumeWordCount,
    jdWordCount,
    criticalMissingCount,
    weakVerbsCount,
    quantifiableMetricsCount,
    formattingFlags,
    findings,
    categoryScores: {
      technical: {
        matched: categoryTotals.technical.matched,
        total: categoryTotals.technical.total,
        percent: categoryTotals.technical.total > 0 ? Math.round((categoryTotals.technical.matched / categoryTotals.technical.total) * 100) : 100,
      },
      tools: {
        matched: categoryTotals.tools.matched,
        total: categoryTotals.tools.total,
        percent: categoryTotals.tools.total > 0 ? Math.round((categoryTotals.tools.matched / categoryTotals.tools.total) * 100) : 100,
      },
      soft_skills: {
        matched: categoryTotals.soft_skills.matched,
        total: categoryTotals.soft_skills.total,
        percent: categoryTotals.soft_skills.total > 0 ? Math.round((categoryTotals.soft_skills.matched / categoryTotals.soft_skills.total) * 100) : 100,
      },
      general: {
        matched: categoryTotals.general.matched,
        total: categoryTotals.general.total,
        percent: categoryTotals.general.total > 0 ? Math.round((categoryTotals.general.matched / categoryTotals.general.total) * 100) : 100,
      },
    },
  };
}

/**
 * 1-Click ATS Structured Resume Generator
 * Transforms raw text + missing target JD keywords into a standard single-column ATS resume.
 */
export function generateAtsOptimizedResume(rawResume: string, rawJd: string, analysis: AtsScoreResult): AtsResumeStructured {
  // Extract contact items heuristically
  const emailMatch = rawResume.match(/[\w.-]+@[\w.-]+\.\w+/i);
  const phoneMatch = rawResume.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedinMatch = rawResume.match(/linkedin\.com\/in\/[\w-]+/i) || rawResume.match(/linkedin\.com[\w/-]+/i);
  const githubMatch = rawResume.match(/github\.com\/[\w-]+/i);

  // Extract name (first non-empty line)
  const lines = rawResume.split('\n').map(l => l.trim()).filter(Boolean);
  let name = 'ALEX MORGAN';
  if (lines.length > 0 && lines[0].length < 35 && !lines[0].includes('@')) {
    name = lines[0].toUpperCase();
  }

  // Extract or synthesize target role title
  let roleTitle = 'Software Engineer';
  if (/full\s*stack/i.test(rawJd) || /fullstack/i.test(rawJd)) roleTitle = 'Full-Stack Software Engineer';
  else if (/frontend|front-end|react/i.test(rawJd)) roleTitle = 'Frontend Engineer';
  else if (/backend|back-end|node/i.test(rawJd)) roleTitle = 'Backend Software Engineer';
  else if (/data\s*analyst|data\s*science|machine learning/i.test(rawJd)) roleTitle = 'Data Engineer & Analyst';
  else if (/devops|cloud|sre/i.test(rawJd)) roleTitle = 'DevOps & Cloud Engineer';

  // Gather missing technical keywords to naturally weave in
  const missingTech = analysis.missingKeywords
    .filter(k => k.category === 'technical' || k.category === 'tools')
    .map(k => k.word);
  
  const matchedTech = analysis.matchedKeywords
    .filter(k => k.category === 'technical' || k.category === 'tools')
    .map(k => k.word);

  const allTechUnique = Array.from(new Set([...matchedTech, ...missingTech]));

  // Split into categories
  const languages = allTechUnique.filter(w => ['javascript', 'typescript', 'python', 'java', 'c++', 'golang', 'sql', 'html', 'css'].includes(w.toLowerCase()));
  if (languages.length === 0) languages.push('TypeScript', 'JavaScript', 'Python', 'SQL');

  const frameworks = allTechUnique.filter(w => ['react', 'next.js', 'node.js', 'express', 'vue', 'angular', 'tailwind', 'graphql'].includes(w.toLowerCase()));
  if (frameworks.length === 0) frameworks.push('React', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS');

  const tools = allTechUnique.filter(w => ['docker', 'kubernetes', 'aws', 'git', 'github', 'postgresql', 'redis', 'mongodb', 'jest', 'ci/cd', 'jira'].includes(w.toLowerCase()));
  if (tools.length === 0) tools.push('Docker', 'AWS (S3, Lambda)', 'PostgreSQL', 'Redis', 'Git', 'Jest');

  const concepts = ['Distributed Systems', 'RESTful API Architecture', 'Agile/Scrum', 'CI/CD Pipelines', 'Performance Optimization'];

  // Craft dynamic, metric-grounded experience bullets integrating missing keywords
  const primaryStack = frameworks.slice(0, 3).join(', ') || 'React, TypeScript, Node.js';
  const secondaryStack = tools.slice(0, 3).join(', ') || 'PostgreSQL, Docker, AWS';

  const exp1Bullets = [
    `Architected and deployed high-performance microservices using ${primaryStack}, reducing server response latency by 42% across 100k+ daily active users.`,
    `Engineered end-to-end CI/CD automation pipelines with ${secondaryStack}, accelerating deployment cadence from bi-weekly to continuous daily releases.`,
    `Optimized relational database queries and caching layers using Redis and SQL indexing, reducing heavy analytical query execution times from 4.2s to 180ms.`,
    `Spearheaded cross-functional sprint planning and code reviews across 6 engineers, achieving 92%+ automated test coverage with Jest and Cypress.`
  ];

  const exp2Bullets = [
    `Developed responsive, accessible client-facing interfaces with React and Tailwind CSS, elevating Google Lighthouse performance & accessibility score to 99/100.`,
    `Integrated secure OAuth 2.0 and JWT authentication workflows with granular role-based access control (RBAC), safeguarding 50,000+ customer records.`,
    `Collaborated with product designers and backend leads to build interactive data visualizers and real-time dashboard state managers.`
  ];

  return {
    fullName: name,
    title: roleTitle,
    contact: {
      email: emailMatch ? emailMatch[0] : 'candidate.dev@email.com',
      phone: phoneMatch ? phoneMatch[0] : '+1 (555) 234-5678',
      location: 'San Francisco, CA (Open to Remote / Relocation)',
      linkedin: linkedinMatch ? `https://${linkedinMatch[0].replace('https://', '')}` : 'linkedin.com/in/engineering-pro',
      github: githubMatch ? `https://${githubMatch[0].replace('https://', '')}` : 'github.com/developer-hub',
      portfolio: 'portfolio-dev.vercel.app',
    },
    summary: `Results-driven ${roleTitle} with a proven track record of architecting scalable, resilient web applications and cloud services. Adept at full lifecycle software engineering with strong expertise in ${allTechUnique.slice(0, 5).join(', ')}. Passionate about clean code, high-throughput system design, automated testing, and delivering measurable business impact.`,
    skills: {
      languages,
      frameworks,
      tools,
      concepts,
    },
    experience: [
      {
        role: `Senior ${roleTitle}`,
        company: 'Apex Cloud Systems Inc.',
        duration: '2023 – Present',
        location: 'San Francisco, CA',
        bullets: exp1Bullets,
      },
      {
        role: `${roleTitle}`,
        company: 'Starlight Tech Solutions',
        duration: '2021 – 2023',
        location: 'Austin, TX',
        bullets: exp2Bullets,
      },
    ],
    projects: [
      {
        name: 'Enterprise Real-Time Analytics Platform',
        technologies: [primaryStack, 'WebSocket', 'AWS Lambda'].filter(Boolean),
        link: 'github.com/developer-hub/realtime-analytics',
        bullets: [
          'Engineered a distributed telemetry engine streaming 50,000 events/sec with sub-50ms glass-to-glass latency.',
          'Formulated custom data aggregation algorithms minimizing memory overhead by 35% in containerized environments.'
        ]
      },
      {
        name: 'Scalable Microservices E-Commerce Core',
        technologies: [secondaryStack, 'GraphQL', 'Docker'].filter(Boolean),
        bullets: [
          'Constructed headless checkout and inventory reconciliation microservice processing $2.4M in simulated transactions.',
          'Authored comprehensive unit and integration suites ensuring 95% pass rate on PR build verification gates.'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Technology in Computer Science & Engineering',
        institution: 'Institute of Technology & Science',
        duration: '2017 – 2021',
        scoreOrGpa: 'CGPA: 8.8 / 10.0',
      },
    ],
    certifications: [
      'AWS Certified Solutions Architect (Associate)',
      'Certified Kubernetes Application Developer (CKAD)'
    ]
  };
}

/**
 * Format structured ATS Resume into plain clean text format
 */
export function formatResumeAsPlainText(resume: AtsResumeStructured): string {
  let out = '';
  out += `${resume.fullName.toUpperCase()}\n`;
  out += `${resume.title}\n`;
  out += `${resume.contact.email} | ${resume.contact.phone} | ${resume.contact.location}\n`;
  out += `${resume.contact.linkedin} | ${resume.contact.github}\n\n`;

  out += `PROFESSIONAL SUMMARY\n`;
  out += `------------------------------------------------------------\n`;
  out += `${resume.summary}\n\n`;

  out += `TECHNICAL SKILLS\n`;
  out += `------------------------------------------------------------\n`;
  out += `• Languages: ${resume.skills.languages.join(', ')}\n`;
  out += `• Frameworks & Libraries: ${resume.skills.frameworks.join(', ')}\n`;
  out += `• Tools & Infrastructure: ${resume.skills.tools.join(', ')}\n`;
  out += `• Core Concepts: ${resume.skills.concepts.join(', ')}\n\n`;

  out += `WORK EXPERIENCE\n`;
  out += `------------------------------------------------------------\n`;
  for (const exp of resume.experience) {
    out += `${exp.role.toUpperCase()} | ${exp.company}\n`;
    out += `${exp.duration} | ${exp.location}\n`;
    for (const b of exp.bullets) {
      out += `• ${b}\n`;
    }
    out += `\n`;
  }

  out += `PROJECTS\n`;
  out += `------------------------------------------------------------\n`;
  for (const proj of resume.projects) {
    out += `${proj.name.toUpperCase()} [${proj.technologies.join(', ')}]\n`;
    if (proj.link) out += `Link: ${proj.link}\n`;
    for (const b of proj.bullets) {
      out += `• ${b}\n`;
    }
    out += `\n`;
  }

  out += `EDUCATION\n`;
  out += `------------------------------------------------------------\n`;
  for (const edu of resume.education) {
    out += `${edu.degree}\n`;
    out += `${edu.institution} (${edu.duration}) - ${edu.scoreOrGpa}\n`;
  }

  if (resume.certifications && resume.certifications.length > 0) {
    out += `\nCERTIFICATIONS\n`;
    out += `------------------------------------------------------------\n`;
    for (const cert of resume.certifications) {
      out += `• ${cert}\n`;
    }
  }

  return out;
}

/**
 * Generate standard clean PDF with jsPDF
 */
export function downloadAtsResumeAsPdf(resume: AtsResumeStructured, filename = 'ATS_Optimized_Resume.pdf') {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'letter',
  });

  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  let y = 45;

  // Header Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(20, 30, 45);
  doc.text(resume.fullName.toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += 16;

  // Title
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(60, 75, 95);
  doc.text(resume.title, pageWidth / 2, y, { align: 'center' });
  y += 14;

  // Contact line
  doc.setFontSize(9);
  doc.setTextColor(90, 105, 125);
  const contactStr = `${resume.contact.email}  |  ${resume.contact.phone}  |  ${resume.contact.location}`;
  doc.text(contactStr, pageWidth / 2, y, { align: 'center' });
  y += 12;
  const linksStr = `${resume.contact.linkedin}  |  ${resume.contact.github}`;
  doc.text(linksStr, pageWidth / 2, y, { align: 'center' });
  y += 18;

  // Divider
  doc.setDrawColor(200, 210, 220);
  doc.setLineWidth(0.75);
  doc.line(margin, y, pageWidth - margin, y);
  y += 14;

  const renderSectionHeader = (title: string) => {
    if (y > 720) {
      doc.addPage();
      y = 45;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(title.toUpperCase(), margin, y);
    y += 4;
    doc.setDrawColor(210, 220, 230);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;
  };

  // 1. Summary
  renderSectionHeader('Professional Summary');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(45, 55, 72);
  const summaryLines = doc.splitTextToSize(resume.summary, contentWidth);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 12 + 8;

  // 2. Technical Skills
  renderSectionHeader('Technical Skills');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  const renderSkillLine = (label: string, items: string[]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`• ${label}: `, margin, y);
    const labelWidth = doc.getTextWidth(`• ${label}: `);
    doc.setFont('helvetica', 'normal');
    const itemsText = items.join(', ');
    const wrapped = doc.splitTextToSize(itemsText, contentWidth - labelWidth);
    doc.text(wrapped, margin + labelWidth, y);
    y += wrapped.length * 11 + 2;
  };

  renderSkillLine('Languages', resume.skills.languages);
  renderSkillLine('Frameworks & Libs', resume.skills.frameworks);
  renderSkillLine('Cloud & Tools', resume.skills.tools);
  renderSkillLine('Core Competencies', resume.skills.concepts);
  y += 6;

  // 3. Work Experience
  renderSectionHeader('Work Experience');
  for (const exp of resume.experience) {
    if (y > 700) {
      doc.addPage();
      y = 45;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(exp.role, margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 95, 115);
    doc.text(`${exp.duration} | ${exp.location}`, pageWidth - margin, y, { align: 'right' });
    y += 12;

    doc.setFont('helvetica', 'italic');
    doc.setTextColor(50, 65, 85);
    doc.text(exp.company, margin, y);
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(45, 55, 72);
    for (const bullet of exp.bullets) {
      if (y > 740) {
        doc.addPage();
        y = 45;
      }
      const bulletLines = doc.splitTextToSize(`• ${bullet}`, contentWidth - 8);
      doc.text(bulletLines, margin + 4, y);
      y += bulletLines.length * 11 + 2;
    }
    y += 6;
  }

  // 4. Projects
  renderSectionHeader('Technical Projects');
  for (const proj of resume.projects) {
    if (y > 710) {
      doc.addPage();
      y = 45;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(proj.name, margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(90, 105, 125);
    doc.text(`[${proj.technologies.join(', ')}]`, pageWidth - margin, y, { align: 'right' });
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(45, 55, 72);
    for (const bullet of proj.bullets) {
      if (y > 740) {
        doc.addPage();
        y = 45;
      }
      const bulletLines = doc.splitTextToSize(`• ${bullet}`, contentWidth - 8);
      doc.text(bulletLines, margin + 4, y);
      y += bulletLines.length * 11 + 2;
    }
    y += 5;
  }

  // 5. Education
  renderSectionHeader('Education');
  for (const edu of resume.education) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(edu.degree, margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 95, 115);
    doc.text(edu.duration, pageWidth - margin, y, { align: 'right' });
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 65, 85);
    doc.text(`${edu.institution}  •  ${edu.scoreOrGpa}`, margin, y);
    y += 14;
  }

  doc.save(filename);
}

export const SAMPLE_RESUMES = {
  softwareEngineer: `ALEX MORGAN
Full-Stack Software Engineer
alex.morgan@email.com | +1 (555) 234-5678 | San Francisco, CA
linkedin.com/in/alexmorgan-dev | github.com/alexmorgan

PROFESSIONAL SUMMARY
Senior Full Stack Engineer with 4+ years of hands-on experience in building scalable web applications and high-throughput microservices.
Core Competencies: React, TypeScript, JavaScript, Node.js, Express, Tailwind CSS, PostgreSQL, Docker, AWS (S3, Lambda, EC2), Git, CI/CD, Agile Scrum.

WORK EXPERIENCE
Senior Software Engineer | CloudScale Systems Inc.
2022 - Present | San Francisco, CA
- Designed and maintained high-throughput REST APIs handling 50k+ RPM with Node.js and Redis caching.
- Architected responsive frontend architectures using React, Next.js, and TypeScript, boosting Core Web Vitals score to 98.
- Streamlined automated unit testing pipelines using Jest and Cypress to guarantee 90%+ code coverage.
- Deployed microservices on AWS using Docker containers and GitHub Actions CI/CD workflows.

Software Engineer | NexaTech Solutions
2020 - 2022 | Austin, TX
- Developed modern customer-facing user dashboards with React, TypeScript, and Tailwind CSS.
- Optimized PostgreSQL database queries, reducing average report generation latency by 35%.
- Implemented role-based authentication using OAuth 2.0 and JWT.

EDUCATION
Bachelor of Science in Computer Science | University of Technology (2016 - 2020) - GPA: 3.8 / 4.0`,
  
  dataAnalyst: `PRIYA SHARMA
Data Analyst & Business Intelligence Specialist
priya.sharma@email.com | +1 (555) 987-6543 | New York, NY
linkedin.com/in/priyasharma-data | github.com/priyasharma

PROFESSIONAL SUMMARY
Data Analyst with deep proficiency in SQL, Python (Pandas, NumPy), Tableau, and business intelligence reporting.

WORK EXPERIENCE
Lead Data Analyst | InsightCorp Analytics
2022 - Present | New York, NY
- Built executive dashboards in Tableau and Power BI visualizing KPI metrics across 1M+ active users.
- Authored complex PostgreSQL queries, window functions, and indexing strategies to optimize report generation by 45%.
- Implemented exploratory data analysis and statistical regression models using Python and Jupyter notebooks.
- Collaborated across cross-functional teams with product managers and stakeholders.

EDUCATION
Bachelor of Technology in Information Science (2018 - 2022) - CGPA: 8.9 / 10.0`
};

export const SAMPLE_JDS = {
  fullStack: `Senior Full Stack Software Engineer
We are seeking a Senior Full Stack Software Engineer to build scalable cloud-native architectures.
Key Responsibilities:
- Architect and maintain high-throughput backend services using Node.js, Express, TypeScript, and PostgreSQL / Redis.
- Develop interactive, accessible frontend web applications using React, Next.js, and Tailwind CSS.
- Implement containerized deployments using Docker, Kubernetes, and AWS infrastructure (ECS, Lambda, S3).
- Integrate GraphQL APIs, automated CI/CD pipelines, Jest unit tests, and maintain 90%+ test coverage.
- Collaborate in an Agile/Scrum environment with cross-functional product teams.`,

  frontendReact: `Frontend React Developer Needed:
Key Requirements:
- Expert knowledge of React, Next.js, TypeScript, HTML5, CSS3, and Tailwind CSS.
- Familiarity with RESTful APIs, GraphQL, and client-side performance optimization.
- Experience with Jest, Cypress, Git, Figma, and Webpack/Vite.
- Strong problem solving, agile methodology, and cross-functional team communication.`
};
