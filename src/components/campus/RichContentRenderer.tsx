import React, { useState } from 'react';
import { Copy, Check, ExternalLink, FileText, Code, Terminal } from 'lucide-react';

interface RichContentRendererProps {
  content: string;
  className?: string;
}

export const RichContentRenderer: React.FC<RichContentRendererProps> = ({
  content,
  className = '',
}) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const handleCopyCode = async (codeText: string, index: number) => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopiedCodeIndex(index);
      setTimeout(() => setCopiedCodeIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy code snippet:', err);
    }
  };

  // Helper to extract links and render them as interactive pills
  const renderTextWithLinks = (text: string, textKeyPrefix: string) => {
    // Regex for URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, pIdx) => {
      if (part.match(urlRegex)) {
        const isDrive = part.includes('drive.google.com') || part.includes('docs.google.com');
        const isGitHub = part.includes('github.com');

        if (isDrive) {
          return (
            <a
              key={`${textKeyPrefix}-link-${pIdx}`}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 my-1 mr-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold text-xs transition-colors shadow-2xs group align-middle cursor-pointer"
              title="Open Google Drive document / notes"
            >
              <FileText className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
              <span className="truncate max-w-[200px] sm:max-w-xs">Google Drive Resource</span>
              <ExternalLink className="w-3 h-3 text-rose-500 opacity-70" />
            </a>
          );
        }

        if (isGitHub) {
          return (
            <a
              key={`${textKeyPrefix}-link-${pIdx}`}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 my-1 mr-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-2xs group align-middle cursor-pointer"
              title="Open GitHub repository"
            >
              <Code className="w-3.5 h-3.5 text-pink-400 group-hover:scale-110 transition-transform" />
              <span className="truncate max-w-[200px] sm:max-w-xs">GitHub Repository</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          );
        }

        // Generic URL pill
        return (
          <a
            key={`${textKeyPrefix}-link-${pIdx}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 my-1 mr-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 font-semibold text-xs transition-colors shadow-2xs group align-middle cursor-pointer"
            title={part}
          >
            <ExternalLink className="w-3.5 h-3.5 text-pink-600 group-hover:scale-110 transition-transform" />
            <span className="truncate max-w-[180px] sm:max-w-xs">{part.replace(/^https?:\/\//, '')}</span>
          </a>
        );
      }

      return <span key={`${textKeyPrefix}-txt-${pIdx}`}>{part}</span>;
    });
  };

  // Split content by code blocks ```...```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;
  const segments: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: content.slice(lastIndex, match.index),
      });
    }

    segments.push({
      type: 'code',
      language: match[1]?.trim() || 'code',
      content: match[2]?.trim() || '',
    });

    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    segments.push({
      type: 'text',
      content: content.slice(lastIndex),
    });
  }

  if (segments.length === 0) {
    segments.push({ type: 'text', content });
  }

  return (
    <div className={`space-y-2.5 text-slate-800 leading-relaxed break-words text-xs ${className}`}>
      {segments.map((segment, idx) => {
        if (segment.type === 'code') {
          const isCopied = copiedCodeIndex === idx;
          return (
            <div
              key={`code-${idx}`}
              className="my-2 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xs"
            >
              {/* Code snippet header bar */}
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 font-mono text-pink-400">
                  <Terminal className="w-3.5 h-3.5" />
                  <span className="uppercase font-bold tracking-wider">{segment.language || 'Code Snippet'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(segment.content, idx)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors active:scale-95 cursor-pointer"
                  title="Copy code to clipboard"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code content */}
              <pre className="p-3.5 font-mono text-[12px] leading-relaxed text-pink-300 overflow-x-auto whitespace-pre">
                <code>{segment.content}</code>
              </pre>
            </div>
          );
        }

        // Regular text segment: split by line breaks to preserve formatting and render links
        const lines = segment.content.split('\n');
        return (
          <div key={`text-seg-${idx}`} className="space-y-1">
            {lines.map((line, lIdx) => (
              <p key={`line-${idx}-${lIdx}`} className="min-h-[1.2em]">
                {renderTextWithLinks(line, `seg-${idx}-line-${lIdx}`)}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
};
