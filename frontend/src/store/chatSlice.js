import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Async Thunks
export const fetchChats = createAsyncThunk(
    'chat/fetchChats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/chats/');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.detail);
        }
    }
);

export const createNewChat = createAsyncThunk(
    'chat/createNewChat',
    async (title, { dispatch, rejectWithValue }) => {
        try {
            const response = await api.post('/chats/', { title });
            dispatch(fetchChats()); // Refresh the chat list
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.detail);
        }
    }
);

export const fetchMessagesForChat = createAsyncThunk(
    'chat/fetchMessagesForChat',
    async (chatId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/chats/${chatId}/messages`);
            return { chatId, messages: response.data };
        } catch (error) {
            return rejectWithValue(error.response.data.detail);
        }
    }
);

// Slice
const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chats: [],
        activeChatId: null,
        messages: {}, // { chatId: [messages] }
        status: 'idle',
        error: null,
    },
    reducers: {
        setActiveChat: (state, action) => {
            state.activeChatId = action.payload;
        },
        addMessage: (state, action) => {
            const message = action.payload;
            if (state.messages[message.chatId]) {
                 // Prevent duplicate messages from websocket
                if (!state.messages[message.chatId].find(m => m.id === message.id)) {
                    state.messages[message.chatId].push(message);
                }
            } else {
                state.messages[message.chatId] = [message];
            }
        },
        clearChatState: (state) => {
            state.chats = [];
            state.activeChatId = null;
            state.messages = {};
            state.status = 'idle';
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Chats
            .addCase(fetchChats.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchChats.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.chats = action.payload;
            })
            .addCase(fetchChats.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Fetch Messages
            .addCase(fetchMessagesForChat.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchMessagesForChat.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.messages[action.payload.chatId] = action.payload.messages;
            })
            .addCase(fetchMessagesForChat.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Create New Chat
            .addCase(createNewChat.fulfilled, (state, action) => {
                state.activeChatId = action.payload.id;
            });
    },
});

export const { setActiveChat, addMessage, clearChatState } = chatSlice.actions;
export default chatSlice.reducer;