import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { webSocketService } from '../../services/websocket';

const MessageInput = ({ chatId }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && chatId) {
            webSocketService.sendMessage(message);
            setMessage('');
        }
    };

    return (
        <div className="p-4 bg-secondary">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow p-3 rounded-md bg-primary border border-gray-600 focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                    type="submit"
                    className="p-3 bg-accent text-white rounded-md hover:bg-blue-600 disabled:bg-gray-500"
                    disabled={!message.trim()}
                >
                    <FaPaperPlane />
                </button>
            </form>
        </div>
    );
};

export default MessageInput;