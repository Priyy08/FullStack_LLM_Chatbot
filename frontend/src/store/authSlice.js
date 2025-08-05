import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auth } from '../firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    updateProfile
} from 'firebase/auth';
import api from '../services/api';

// Async Thunk for User Registration (remains the same)
export const signUpUser = createAsyncThunk(
    'auth/signUpUser',
    async ({ email, password, displayName }, { rejectWithValue }) => {
        try {
            // Step 1: Create user in Firebase Auth on the client
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Step 2: Update the profile (displayName) in Firebase Auth
            await updateProfile(userCredential.user, { displayName });
            return { uid: userCredential.user.uid };
        } catch (error) {
            // Handle specific Firebase errors more gracefully
            if (error.code === 'auth/email-already-in-use') {
                return rejectWithValue('An account with this email already exists.');
            }
            return rejectWithValue(error.code || error.message);
        }
    }
);

// Async Thunk for User Login (remains the same)
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            return rejectWithValue(error.code || error.message);
        }
    }
);

// Async Thunk for User Logout (remains the same)
export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
    await signOut(auth);
});

// The Auth Slice
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {
        // This action will be called by our Firebase auth state listener
        setAuthUser: (state, action) => {
            state.user = action.payload;
            state.status = 'succeeded';
        },
        clearAuthUser: (state) => {
            state.user = null;
        },
        setAuthStatus: (state, action) => {
            state.status = action.payload;
        },
        setAuthError: (state, action) => {
            state.error = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // SignUp
            .addCase(signUpUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(signUpUser.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(signUpUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { setAuthUser, clearAuthUser, setAuthStatus, setAuthError } = authSlice.actions;
export default authSlice.reducer;
