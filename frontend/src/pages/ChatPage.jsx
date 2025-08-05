import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import ChatSidebar from '../components/Chat/ChatSidebar';
import ChatContainer from '../components/Chat/ChatContainer';
import { fetchChats } from '../store/chatSlice';

const ChatPage = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        // Fetch the list of chats when the component mounts
        dispatch(fetchChats());
    }, [dispatch]);
    
    return (
        <div className="flex h-screen w-screen overflow-hidden">
            <ChatSidebar />
            <ChatContainer />
        </div>
    );
};

export default ChatPage;