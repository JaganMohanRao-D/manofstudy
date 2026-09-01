/**
 * Developer Utilities: JSON, Encoder/Decoder, and SQL Formatter
 */

// ----------------------------------------------------
// 1. JSON Formatter & Linter
// ----------------------------------------------------
export interface JsonLintResult {
  isValid: boolean;
  formatted?: string;
  error?: string;
  errorLine?: number;
  errorColumn?: number;
  stats?: {
    sizeBytes: number;
    keyCount: number;
    depth: number;
  };
}

export function formatJson(input: string, indent: number | string = 2): JsonLintResult {
  if (!input.trim()) {
    return { isValid: true, formatted: '', stats: { sizeBytes: 0, keyCount: 0, depth: 0 } };
  }

  try {
    const parsed = JSON.parse(input);
    const space = typeof indent === 'number' ? indent : '\t';
    const formatted = JSON.stringify(parsed, null, space);

    let keyCount = 0;
    let maxDepth = 0;

    const countKeysAndDepth = (obj: unknown, currentDepth = 1) => {
      if (currentDepth > maxDepth) maxDepth = currentDepth;
      if (obj && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          obj.forEach(item => countKeysAndDepth(item, currentDepth + 1));
        } else {
          for (const key of Object.keys(obj)) {
            keyCount++;
            countKeysAndDepth((obj as Record<string, unknown>)[key], currentDepth + 1);
          }
        }
      }
    };

    countKeysAndDepth(parsed);

    return {
      isValid: true,
      formatted,
      stats: {
        sizeBytes: new Blob([formatted]).size,
        keyCount,
        depth: maxDepth,
      },
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    // Parse line/column from error if available (e.g. "at position 42")
    let line: number | undefined;
    let col: number | undefined;

    const posMatch = errorMessage.match(/position\s+(\d+)/i);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const textUpToPos = input.substring(0, pos);
      const lines = textUpToPos.split('\n');
      line = lines.length;
      col = lines[lines.length - 1].length + 1;
    }

    return {
      isValid: false,
      error: errorMessage,
      errorLine: line,
      errorColumn: col,
    };
  }
}

export function minifyJson(input: string): JsonLintResult {
  if (!input.trim()) return { isValid: true, formatted: '' };
  try {
    const parsed = JSON.parse(input);
    const minified = JSON.stringify(parsed);
    return {
      isValid: true,
      formatted: minified,
      stats: {
        sizeBytes: new Blob([minified]).size,
        keyCount: 0,
        depth: 0,
      },
    };
  } catch (err: unknown) {
    return {
      isValid: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ----------------------------------------------------
// 2. Base64, URL, Hex & HTML Transformations (Unicode Safe)
// ----------------------------------------------------
export function unicodeBase64Encode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function unicodeBase64Decode(str: string): string {
  const binary = atob(str.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function stringToHex(str: string): string {
  const bytes = new TextEncoder().encode(str);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join(' ');
}

export function hexToString(hex: string): string {
  const cleaned = hex.replace(/[^0-9a-fA-F]/g, '');
  if (cleaned.length % 2 !== 0) {
    throw new Error('Invalid hex string length (must be even)');
  }
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes[i / 2] = parseInt(cleaned.substring(i, i + 2), 16);
  }
  return new TextDecoder().decode(bytes);
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function unescapeHtml(str: string): string {
  const doc = new DOMParser().parseFromString(str, 'text/html');
  return doc.documentElement.textContent || '';
}

// ----------------------------------------------------
// 3. SQL Query Formatter
// ----------------------------------------------------
const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 
  'FULL JOIN', 'CROSS JOIN', 'JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 
  'LIMIT', 'OFFSET', 'UNION ALL', 'UNION', 'INSERT INTO', 'VALUES', 'UPDATE', 
  'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'DISTINCT',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'AS', 'IN', 'NOT IN', 'EXISTS', 
  'BETWEEN', 'LIKE', 'IS NULL', 'IS NOT NULL', 'WITH', 'COUNT', 'SUM', 'AVG', 
  'MIN', 'MAX', 'ASC', 'DESC'
];

export function formatSql(rawSql: string, indentSize = 2): string {
  if (!rawSql.trim()) return '';

  let sql = rawSql.trim();

  // 1. Replace major keywords with standardized spacing and uppercase
  // Major newline keywords
  const majorKeywords = [
    'SELECT', 'FROM', 'WHERE', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 
    'FULL JOIN', 'CROSS JOIN', 'JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 
    'LIMIT', 'OFFSET', 'UNION ALL', 'UNION', 'INSERT INTO', 'VALUES', 
    'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'WITH'
  ];

  // Tokenize comments and strings to protect them
  const stringLiterals: string[] = [];
  sql = sql.replace(/'(?:[^'\\]|\\.)*'/g, match => {
    stringLiterals.push(match);
    return `___STR_LITERAL_${stringLiterals.length - 1}___`;
  });

  // Capitalize all SQL keywords
  for (const kw of SQL_KEYWORDS) {
    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
    sql = sql.replace(regex, kw);
  }

  // Add line breaks before major clauses
  for (const kw of majorKeywords) {
    const regex = new RegExp(`\\s*\\b(${kw})\\b\\s*`, 'gi');
    sql = sql.replace(regex, `\n$1 `);
  }

  // Handle AND / OR indentation
  sql = sql.replace(/\s*\b(AND|OR)\b\s*/gi, `\n${' '.repeat(indentSize)}$1 `);

  // Handle commas in SELECT lists
  // Format lines
  const lines = sql.split('\n');
  const formattedLines: string[] = [];
  let inSelect = false;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith('SELECT')) {
      inSelect = true;
      formattedLines.push(line);
      continue;
    }

    if (line.startsWith('FROM') || line.startsWith('WHERE') || line.startsWith('JOIN') || line.startsWith('ORDER') || line.startsWith('GROUP')) {
      inSelect = false;
    }

    if (inSelect && line.includes(',')) {
      // Split comma separated select items
      const items = line.split(',');
      items.forEach((item, idx) => {
        const trimmed = item.trim();
        if (trimmed) {
          formattedLines.push(`${' '.repeat(indentSize)}${trimmed}${idx < items.length - 1 ? ',' : ''}`);
        }
      });
    } else if (line.startsWith('AND') || line.startsWith('OR') || line.startsWith('ON')) {
      formattedLines.push(`${' '.repeat(indentSize)}${line}`);
    } else {
      formattedLines.push(line);
    }
  }

  let result = formattedLines.join('\n');

  // Restore string literals
  stringLiterals.forEach((str, idx) => {
    result = result.replace(`___STR_LITERAL_${idx}___`, str);
  });

  return result.trim();
}

export const SAMPLE_JSON = `{
  "userId": 10842,
  "developer": {
    "name": "Alex Chen",
    "role": "Lead Architect",
    "skills": ["TypeScript", "React", "Rust", "Docker", "Kubernetes"],
    "preferences": {
      "theme": "cyberpunk_dark",
      "tabSize": 2,
      "notifications": true
    }
  },
  "metrics": {
    "projectsCompleted": 47,
    "uptimePercent": 99.98,
    "stars": 1250
  }
}`;

export const SAMPLE_SQL = `select u.id, u.username, u.email, count(o.order_id) as total_orders, sum(o.amount) as total_spent from users u left join orders o on u.id = o.user_id where u.is_active = true and o.created_at >= '2025-01-01' group by u.id, u.username, u.email having sum(o.amount) > 500 order by total_spent desc limit 50;`;
