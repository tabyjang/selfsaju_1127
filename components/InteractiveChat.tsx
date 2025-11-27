import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { LoadingSpinner, SendIcon, SparklesIcon } from './icons';

interface InteractiveChatProps {
  onSendMessage: (message: string) => void;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

const renderChatMessage = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n').map(line => line.trim());

    return lines.map((line, index) => {
        if (!line) return <br key={index} />;

        if (line.startsWith('## ')) {
            return <h2 key={index} className="text-xl font-bold mt-4 mb-2">{line.replace('## ', '')}</h2>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
             return <h4 key={index} className="text-lg font-semibold mt-3 mb-1 text-amber-600">{line.replace(/\*\*/g, '')}</h4>;
        }
        
        const renderedLine = line.split('**').map((part, i) => 
            i % 2 === 1 ? <strong key={i} className="font-bold text-gray-800">{part}</strong> : <span key={i}>{part}</span>
        );

        return <p key={index} className="my-1">{renderedLine}</p>;
    });
};

export const InteractiveChat: React.FC<InteractiveChatProps> = ({
  onSendMessage,
  chatHistory,
  isLoading,
  error,
}) => {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const initialMessage = {
      role: 'model' as const,
      content: '분석 결과를 바탕으로 AI에게 궁금한 점을 자유롭게 물어보세요.'
  }

  const messagesToShow = [initialMessage, ...chatHistory];

  return (
    <div className="mt-12 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-6">
            <SparklesIcon className="w-8 h-8 text-yellow-500" />
            <h2 className="text-3xl font-bold text-gray-800 text-center">AI와 추가 상담하기</h2>
        </div>
        <div className="glass-card p-4 md:p-6 flex flex-col h-[60vh] max-h-[700px]">
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                {messagesToShow.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                         {msg.role === 'model' && (
                             <div className="w-9 h-9 rounded-full bg-yellow-500 flex-shrink-0 flex items-center justify-center shadow-lg">
                                <SparklesIcon className="w-5 h-5 text-white" />
                            </div>
                        )}
                        <div className={`max-w-xl p-4 rounded-2xl shadow-md ${msg.role === 'user' ? 'bg-amber-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                           <div className="prose prose-sm max-w-none">
                                {renderChatMessage(msg.content)}
                                {isLoading && msg.role === 'model' && index === messagesToShow.length - 1 && (
                                     <div className="animate-pulse">...</div>
                                )}
                           </div>
                        </div>
                    </div>
                ))}
                 {isLoading && chatHistory.length > 0 && chatHistory[chatHistory.length-1].role === 'user' &&(
                     <div className="flex items-start gap-4">
                        <div className="w-9 h-9 rounded-full bg-yellow-500 flex-shrink-0 flex items-center justify-center shadow-lg">
                            <SparklesIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="max-w-xl p-4 rounded-2xl shadow-md bg-gray-100 text-gray-800 rounded-bl-none">
                            <LoadingSpinner className="w-6 h-6 text-yellow-500" />
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
                {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="flex gap-3 items-center">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="AI에게 질문을 입력하세요..."
                        className="flex-1 p-3 bg-white/50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                        rows={1}
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !input.trim()}
                        className="p-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-yellow-500 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white"
                        aria-label="Send message"
                    >
                        {isLoading ? <LoadingSpinner className="w-6 h-6" /> : <SendIcon className="w-6 h-6" />}
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
};