import { useState } from 'react';

interface TextareaProps {
  onSubmit(content: string): void;
}

function Textarea({ onSubmit }: TextareaProps) {
  const [content, setContent] = useState('');

  const sendMessage = () => {
    onSubmit(content);
    setContent('');
  };

  return (
    <div className="flex h-fit w-full flex-row items-center justify-start">
      <textarea
        placeholder="plase input here."
        className="h-20 w-full resize-none border-none bg-neutral-300 p-3 text-sm text-black"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
          }
        }}
      />
      <button
        className="h-full border-b border-inherit bg-neutral-800 px-3"
        onClick={() => {
          sendMessage();
        }}
      >
        send
      </button>
    </div>
  );
}

export default Textarea;
