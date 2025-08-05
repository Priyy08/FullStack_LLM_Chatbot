// import React, { useEffect, useRef, useMemo } from 'react';
// import { useSelector } from 'react-redux';
// import Message from './Message';
// import Loading from '../Common/Loading';

// const MessageList = () => {
//     const { messages, status } = useSelector((state) => state.chat);
//     // useMemo for stable dependency
//     const activeMessages = useMemo(() => (messages && messages.length > 0 ? messages : []), [messages]);
//     const messagesEndRef = useRef(null);

//     const scrollToBottom = () => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     };

//     useEffect(() => {
//         scrollToBottom();
//     }, [activeMessages]);

//     if (status === 'loading' && !activeMessages.length) {
//         return <Loading />;
//     }

//     return (
//         <div className="flex-grow p-4 overflow-y-auto">
//             {activeMessages.map((msg, index) => (
//                 <Message key={msg.id || index} message={msg} />
//             ))}
//             <div ref={messagesEndRef} />
//         </div>
//     );
// };

// export default MessageList;

import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Message from './Message'; // Ensure this component is named Message.jsx
import Loading from '../Common/Loading'; // Ensure this component is named Loading.jsx

const MessageList = () => {
    // Select the entire chat state
    const chatState = useSelector((state) => state.chat);
    const { activeChatId, messages, status } = chatState;
    
    // Get the messages for the currently active chat, or an empty array if none
    const activeMessages = messages[activeChatId] || [];
    
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Scroll to bottom whenever the messages array for the active chat changes
    useEffect(() => {
        scrollToBottom();
    }, [activeMessages]);

    // Show a loading spinner if we are fetching messages for the first time
    if (status === 'loading' && activeMessages.length === 0) {
        return <Loading />;
    }

    return (
        <div className="flex-grow p-4 overflow-y-auto">
            {/* Map over the activeMessages array to render each Message component */}
            {activeMessages.map((msg) => (
                <Message key={msg.id} message={msg} />
            ))}
            {/* This empty div is the target to scroll to */}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;