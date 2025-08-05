import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/authSlice';
import { createNewChat, setActiveChat, clearChatState } from '../../store/chatSlice';
import { FaPlus, FaSignOutAlt } from 'react-icons/fa';

const ChatSidebar = () => {
    const dispatch = useDispatch();
    const { chats, activeChatId } = useSelector((state) => state.chat);

    const handleNewChat = () => {
        const title = `New Chat ${new Date().toLocaleString()}`;
        dispatch(createNewChat(title));
    };

    const handleLogout = () => {
        dispatch(logoutUser());
        dispatch(clearChatState());
    };

    return (
        <div className="bg-secondary w-64 h-full flex flex-col p-3">
            <button
                onClick={handleNewChat}
                className="flex items-center justify-center w-full p-2 mb-4 text-sm font-semibold text-white bg-accent rounded-md hover:bg-blue-600 transition-colors"
            >
                <FaPlus className="mr-2" /> New Chat
            </button>
            <div className="flex-grow overflow-y-auto">
                <nav>
                    <ul>
                        {chats.map((chat) => (
                            <li key={chat.id} className="mb-2">
                                <button
                                    type="button"
                                    onClick={() => dispatch(setActiveChat(chat.id))}
                                    className={`block w-full text-left p-2 rounded-md truncate ${
                                        activeChatId === chat.id
                                            ? 'bg-primary text-white'
                                            : 'text-text-secondary hover:bg-primary'
                                    }`}
                                >
                                    {chat.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            <div className="mt-auto">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full p-2 text-sm text-text-secondary hover:bg-primary hover:text-white rounded-md transition-colors"
                >
                    <FaSignOutAlt className="mr-2" /> Logout
                </button>
            </div>
        </div>
    );
};

export default ChatSidebar;