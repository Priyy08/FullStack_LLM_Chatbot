import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { signUpUser } from '../../store/authSlice';
import toast from 'react-hot-toast';

const SignupForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status, error } = useSelector((state) => state.auth);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(signUpUser({ email, password, displayName }))
            .unwrap()
            .then(() => {
                toast.success('Account created! Please log in.');
                navigate('/login');
            })
            .catch((err) => {
                toast.error(`Sign up failed: ${err}`);
            });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary">
            <div className="bg-secondary p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-text-primary">Create Account</h2>
                <form onSubmit={handleSubmit}>
                     <div className="mb-4">
                        <label className="block text-text-secondary mb-2" htmlFor="displayName">Display Name</label>
                        <input
                            type="text" id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full p-2 rounded bg-primary text-text-primary border border-gray-600 focus:outline-none focus:border-accent" required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-text-secondary mb-2" htmlFor="email">Email</label>
                        <input
                            type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 rounded bg-primary text-text-primary border border-gray-600 focus:outline-none focus:border-accent" required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-text-secondary mb-2" htmlFor="password">Password</label>
                        <input
                            type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 rounded bg-primary text-text-primary border border-gray-600 focus:outline-none focus:border-accent" required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full bg-accent hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:bg-gray-500"
                    >
                        {status === 'loading' ? 'Creating Account...' : 'Sign Up'}
                    </button>
                    {error && status === 'failed' && <p className="text-red-500 text-xs mt-4">{error}</p>}
                </form>
                <p className="text-center text-text-secondary mt-4">
                    Already have an account? <Link to="/login" className="text-accent hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default SignupForm;