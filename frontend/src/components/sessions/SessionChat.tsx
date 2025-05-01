import { Send } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface ChatMessage {
    userId: string;
    userName: string;
    userImage?: string;
    message: string;
    timestamp: number;
}

interface SessionChatProps {
    messages: ChatMessage[];
    inputValue: string;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSendMessage: () => void;
    currentUserId: string;
}

const SessionChat = ({
    messages,
    inputValue,
    onInputChange,
    onSendMessage,
    currentUserId
}: SessionChatProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle Enter key to send message
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            onSendMessage();
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-96">
            <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="font-medium">Chat</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm">No messages yet</p>
                ) : (
                    messages.map((message, index) => (
                        <div key={index} className={`flex ${message.userId === 'system' ? 'justify-center' : 'items-start'}`}>
                            {message.userId === 'system' ? (
                                <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-md">
                                    {message.message}
                                </div>
                            ) : (
                                <>
                                    {/* User avatar (except for system messages) */}
                                    {message.userId !== 'system' && (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 mr-2">
                                            {message.userImage ? (
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${message.userImage}`}
                                                    alt={message.userName}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className={`w-full h-full rounded-full flex items-center justify-center text-white text-xs font-bold
                          ${message.userId === currentUserId ? 'bg-indigo-600' : 'bg-gray-600'}`}>
                                                    {message.userName.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Message content */}
                                    <div className={`max-w-[75%] overflow-hidden
                    ${message.userId === currentUserId ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}
                    rounded-lg px-3 py-2`}
                                    >
                                        {message.userId !== currentUserId && (
                                            <p className={`text-xs font-medium mb-1 
                        ${message.userId === currentUserId ? 'text-indigo-100' : 'text-gray-600'}`}>
                                                {message.userName}
                                            </p>
                                        )}
                                        <p className="text-sm break-words">{message.message}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-3 flex">
                <input
                    type="text"
                    value={inputValue}
                    onChange={onInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                    onClick={onSendMessage}
                    disabled={!inputValue.trim()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 disabled:opacity-50"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

export default SessionChat;
