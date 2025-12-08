import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.length === 0) continue;

    // Bullet Points
    if (line.startsWith('- ')) {
      elements.push(
        <div key={i} className="flex gap-2 mb-1.5 text-inherit">
          <span className="opacity-60 mt-1.5 w-1.5 h-1.5 bg-current rounded-full flex-shrink-0"></span>
          <span className="opacity-90 leading-relaxed" dangerouslySetInnerHTML={{__html: formatInline(line.substring(2))}} />
        </div>
      );
    }
    // Numbered Lists
    else if (/^\d+\./.test(line)) {
       elements.push(
        <div key={i} className="flex gap-2 mb-1.5 text-inherit">
           <span className="font-mono text-xs pt-1 opacity-60 flex-shrink-0 text-violet-400">{line.split('.')[0]}.</span>
           <span className="opacity-90 leading-relaxed" dangerouslySetInnerHTML={{__html: formatInline(line.substring(line.indexOf('.') + 1))}} />
        </div>
       )
    }
    // Headers (Use carefully inside cards)
    else if (line.startsWith('#### ')) {
       elements.push(<div key={i} className="font-bold mt-3 mb-2 text-zinc-100">{line.replace('#### ', '')}</div>);
    }
    // Regular Text
    else {
      elements.push(<p key={i} className="mb-2 leading-relaxed opacity-90" dangerouslySetInnerHTML={{__html: formatInline(line)}} />);
    }
  }

  return <div className="text-sm">{elements}</div>;
};

const formatInline = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-zinc-100">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-violet-900/30 px-1 py-0.5 rounded text-violet-200 font-mono text-xs border border-violet-800/30">$1</code>');
};

export default MarkdownRenderer;