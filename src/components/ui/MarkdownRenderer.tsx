import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const renderMarkdown = (text: string) => {
    // Handle bold text (**text** or __text__)
    let processed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Handle italic text (*text* or _text_)
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    processed = processed.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Handle code blocks (```code```)
    processed = processed.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm overflow-x-auto"><code>$1</code></pre>');
    
    // Handle inline code (`code`)
    processed = processed.replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 rounded text-sm">$1</code>');
    
    // Handle headers (# ## ###)
    processed = processed.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
    processed = processed.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>');
    processed = processed.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>');
    
    // Handle links [text](url)
    processed = processed.replace(/\[([^\]]*)\]\(([^\)]*)\)/g, '<a href="$2" class="text-blue-500 hover:text-blue-600 underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Handle bullet points (- or *)
    processed = processed.replace(/^[\-\*] (.*$)/gm, '<li class="ml-4">$1</li>');
    
    // Handle numbered lists (1. 2. etc.)
    processed = processed.replace(/^\d+\. (.*$)/gm, '<li class="ml-4">$1</li>');
    
    // Wrap consecutive <li> elements in <ul>
    processed = processed.replace(/(<li.*?>.*?<\/li>(\s*<li.*?>.*?<\/li>)*)/g, '<ul class="list-disc pl-4 space-y-1">$1</ul>');
    
    // Handle line breaks (preserve double line breaks as paragraphs)
    processed = processed.replace(/\n\n/g, '</p><p class="mt-2">');
    processed = '<p>' + processed + '</p>';
    
    // Handle single line breaks within paragraphs
    processed = processed.replace(/\n/g, '<br>');
    
    // Clean up empty paragraphs
    processed = processed.replace(/<p><\/p>/g, '');
    processed = processed.replace(/<p>\s*<\/p>/g, '');
    
    return processed;
  };

  return (
    <div 
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
};

export default MarkdownRenderer;