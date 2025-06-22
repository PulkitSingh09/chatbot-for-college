import TypingIndicator from './TypingIndicator';

interface Message {
  type: 'user' | 'bot';
  content: string;
  timestamp: number;
  isTyping?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  formatDate: (timestamp: number) => string;
  isMobile: boolean;
}

export default function MessageBubble({ message, formatDate, isMobile }: MessageBubbleProps) {
  if (message.isTyping) {
    return (
      <div className="mb-4">
        <div className="inline-block max-w-[80%] rounded-2xl px-4 py-2 bg-white/90 dark:bg-gray-700 shadow-md">
          <TypingIndicator />
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-4 ${message.type === 'user' ? 'text-right' : ''}`}>
      <div
        className={`inline-block max-w-[85%] md:max-w-[80%] rounded-2xl px-3 md:px-4 py-2 md:py-3 ${
          message.type === 'user'
            ? 'bg-indigo-600 text-white shadow-lg'
            : 'bg-white/90 dark:bg-gray-700 text-gray-800 dark:text-white shadow-md'
        } ${isMobile ? 'text-sm' : ''}`}
      >
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
      <div className={`text-xs text-gray-400 mt-1 px-1 ${message.type === 'user' ? 'text-right' : ''}`}>
        {formatDate(message.timestamp)}
      </div>
    </div>
  );
}