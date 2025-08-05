import React from 'react';
import { FaUser, FaRobot } from 'react-icons/fa';

const Message = ({ message }) => {
    const isUser = message.role === 'user';
    return (
        <div className={`flex items-start gap-4 p-4 ${isUser ? '' : 'bg-secondary'}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-accent' : 'bg-gray-600'}`}>
                {isUser ? <FaUser className="text-white" /> : <FaRobot className="text-white" />}
            </div>
            <div className="flex-grow">
                <p className="text-text-primary whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs text-text-secondary mt-1">
                    {new Date(message.timestamp).toLocaleString()}
                </p>
            </div>
        </div>
    );
};

export default Message;