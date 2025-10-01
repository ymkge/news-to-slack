
import React from 'react';

interface CodeBlockProps {
  code: string;
  language: 'json' | 'text';
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  return (
    <div className="bg-slate-950/70 rounded-md overflow-hidden">
      <div className="px-4 py-2 bg-slate-800/50 text-xs text-slate-400 font-mono">
        {language.toUpperCase()}
      </div>
      <pre className="p-4 text-sm text-slate-300 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
