import { useState, useRef } from 'react';
import { Paperclip, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeroInputProps {
  onSubmit: (message: string, files?: File[]) => void;
}

const ChatHeroInput = ({ onSubmit }: ChatHeroInputProps) => {
  const [text, setText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const send = () => {
    if (!text.trim() && attachedFiles.length === 0) return;
    onSubmit(text.trim(), attachedFiles);
    setText('');
    setAttachedFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl px-6 py-4 flex items-center gap-4 shadow-xl relative">
      {/* Attach button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => fileRef.current?.click()}
        className="text-neutral-600 hover:bg-neutral-100 shrink-0 h-10 w-10"
      >
        <Paperclip className="w-5 h-5" />
      </Button>
      
      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          setAttachedFiles(prev => [...prev, ...files]);
        }}
      />

      {/* Show attached files */}
      {attachedFiles.length > 0 && (
        <div className="absolute -top-12 left-0 flex gap-2 flex-wrap">
          {attachedFiles.map((file, index) => (
            <div key={index} className="bg-neutral-100 px-2 py-1 rounded-md text-xs flex items-center gap-1">
              <span className="truncate max-w-20">{file.name}</span>
              <button 
                onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
                className="text-neutral-500 hover:text-neutral-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Text input */}
      <input
        type="text"
        placeholder="Ask Lovable to create a blog about…"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent outline-none text-neutral-800 placeholder:text-neutral-400 text-lg py-2"
      />

      {/* Send button */}
      <Button
        size="icon"
        onClick={send}
        disabled={!text.trim() && attachedFiles.length === 0}
        className="bg-neutral-100 hover:bg-neutral-200 disabled:bg-neutral-50 disabled:text-neutral-300 text-neutral-700 shrink-0 rounded-full h-10 w-10 transition-all"
      >
        <ArrowUp className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default ChatHeroInput;