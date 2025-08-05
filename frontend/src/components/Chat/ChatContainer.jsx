// import React, { useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { webSocketService } from '../../services/websocket';
// import { fetchMessagesForChat, addMessage } from '../../store/chatSlice';
// import MessageList from './MessageList';
// import MessageInput from './MessageInput';
// import { FaComments } from 'react-icons/fa';
// import { auth } from '../../firebase'; // <-- Import the auth instance

// const ChatContainer = () => {
//     const dispatch = useDispatch();
//     const { activeChatId } = useSelector((state) => state.chat);
//     const { user } = useSelector((state) => state.auth); // We use the user object now

//     useEffect(() => {
//         // This function will run when the active chat changes
//         const setupChatSession = async () => {
//             if (activeChatId && user) {
//                 // Fetch initial messages for the chat
//                 dispatch(fetchMessagesForChat(activeChatId));

//                 // --- THIS IS THE CRITICAL FIX ---
//                 // Get the current Firebase user to request a fresh, guaranteed-valid token
//                 const currentUser = auth.currentUser;
//                 if (currentUser) {
//                     try {
//                         const token = await currentUser.getIdToken(true); // 'true' forces a refresh if needed
                        
//                         // Now establish the WebSocket connection with the fresh token
//                         webSocketService.connect(activeChatId, token, (newMessage) => {
//                             dispatch(addMessage(newMessage));
//                         });
//                     } catch (error) {
//                         console.error("Failed to get a valid token for WebSocket:", error);
//                     }
//                 }
//             }
//         };

//         setupChatSession();

//         // Cleanup function: This will be called when the component unmounts
//         // or when activeChatId changes, before the effect runs again.
//         return () => {
//             webSocketService.disconnect();
//         };
//     }, [activeChatId, user, dispatch]); // Effect depends on these values

//     if (!activeChatId) {
//         return (
//             <div className="flex-grow flex flex-col items-center justify-center text-text-secondary">
//                 <FaComments className="w-24 h-24 mb-4" />
//                 <h2 className="text-xl font-semibold">Select a chat to start messaging</h2>
//                 <p>Or create a new one from the sidebar.</p>
//             </div>
//         );
//     }

//     return (
//         <div className="flex-grow flex flex-col h-full bg-primary"> {/* Added bg-primary */}
//             <MessageList />
//             <MessageInput chatId={activeChatId} />
//         </div>
//     );
// };

// export default ChatContainer;

// import React, { useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { webSocketService } from '../../services/websocket';
// import { fetchMessagesForChat, addMessage } from '../../store/chatSlice';
// import MessageList from './MessageList';
// import MessageInput from './MessageInput';
// import { FaComments } from 'react-icons/fa';
// import { auth } from '../../firebase';

// const ChatContainer = () => {
//     const dispatch = useDispatch();
//     const { activeChatId } = useSelector((state) => state.chat);
//     // Destructure the user object to get a stable uid
//     const user = useSelector((state) => state.auth.user);
//     const userId = user ? user.uid : null;

//     useEffect(() => {
//         const setupChatSession = async () => {
//             // We now use userId which is a stable primitive value
//             if (activeChatId && userId) {
//                 dispatch(fetchMessagesForChat(activeChatId));

//                 const currentUser = auth.currentUser;
//                 if (currentUser) {
//                     try {
//                         const token = await currentUser.getIdToken(true);
                        
//                         webSocketService.connect(activeChatId, token, (newMessage) => {
//                             dispatch(addMessage(newMessage));
//                         });
//                     } catch (error) {
//                         console.error("Failed to get a valid token for WebSocket:", error);
//                     }
//                 }
//             }
//         };

//         setupChatSession();

//         return () => {
//             webSocketService.disconnect();
//         };
//     // --- THIS IS THE CRITICAL FIX ---
//     // The dependency array now uses stable primitive values (strings),
//     // which do not change on every re-render.
//     }, [activeChatId, userId, dispatch]); 

//     if (!activeChatId) {
//         return (
//             <div className="flex-grow flex flex-col items-center justify-center text-text-secondary">
//                 <FaComments className="w-24 h-24 mb-4" />
//                 <h2 className="text-xl font-semibold">Select a chat to start messaging</h2>
//                 <p>Or create a new one from the sidebar.</p>
//             </div>
//         );
//     }

//     return (
//         <div className="flex-grow flex flex-col h-full bg-primary">
//             <MessageList />
//             <MessageInput chatId={activeChatId} />
//         </div>
//     );
// };

// export default ChatContainer;

import React, { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { webSocketService } from '../../services/websocket';
import { fetchMessagesForChat, addMessage } from '../../store/chatSlice';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { FaComments } from 'react-icons/fa';
import { auth } from '../../firebase';

const ChatContainer = () => {
    const dispatch = useDispatch();
    const activeChatId = useSelector((state) => state.chat.activeChatId);
    
    // We create a ref to keep track of the currently connected chat ID.
    // This ref will persist across re-renders without causing the effect to re-run.
    const connectedChatIdRef = useRef(null);

    // We wrap our connection logic in useCallback.
    // This memoizes the function so it doesn't get recreated on every render.
    const connectToWebSocket = useCallback(async (chatId) => {
        // Only connect if we are not already connected to this specific chat
        if (chatId && connectedChatIdRef.current !== chatId) {
            // Disconnect from any previous room connection first
            webSocketService.disconnect();

            const currentUser = auth.currentUser;
            if (currentUser) {
                try {
                    const token = await currentUser.getIdToken(true);
                    webSocketService.connect(chatId, token, (newMessage) => {
                        dispatch(addMessage(newMessage));
                    });
                    // Update our ref to show we are now connected to this chat
                    connectedChatIdRef.current = chatId;
                } catch (error) {
                    console.error("Failed to get token for WebSocket:", error);
                }
            }
        }
    }, [dispatch]); // The dispatch function from Redux is guaranteed to be stable

    useEffect(() => {
        // When the active chat changes, fetch its messages
        if (activeChatId) {
            dispatch(fetchMessagesForChat(activeChatId));
            // And connect to the new WebSocket
            connectToWebSocket(activeChatId);
        }

        // The cleanup function for when the component unmounts (e.g., user logs out)
        return () => {
            webSocketService.disconnect();
            connectedChatIdRef.current = null;
        };
    }, [activeChatId, dispatch, connectToWebSocket]); // Effect depends on these stable functions/values

    if (!activeChatId) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center text-text-secondary">
                <FaComments className="w-24 h-24 mb-4" />
                <h2 className="text-xl font-semibold">Select a chat to start messaging</h2>
                <p>Or create a new one from the sidebar.</p>
            </div>
        );
    }

    return (
        <div className="flex-grow flex flex-col h-full bg-primary">
            <MessageList />
            <MessageInput chatId={activeChatId} />
        </div>
    );
};

export default ChatContainer;