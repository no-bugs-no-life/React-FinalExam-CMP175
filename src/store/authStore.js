import { create } from 'zustand';
import axios from 'axios';
import { message } from 'antd';
import { API_URL } from '../configs/api';

const useAuthStore = create((set, get) => ({
    isAuth: false,
    userProfile: null,
    loading: false,

    setAuth: (status) => set({ isAuth: status }),

    login: async (credentials) => {
        set({ loading: true });
        try {
            const { data: response } = await axios.post(`${API_URL}/users/login`, {
                email: credentials.email,
                password: credentials.password
            });

            if (response.success) {
                const { token, user } = response.data;

                // Store token securely
                localStorage.setItem('accessToken', token);

                // Set user profile and authentication status
                set({ 
                    userProfile: user,
                    isAuth: true,
                    loading: false 
                });

                message.success(response.message || 'Login successful');
                return { success: true, message: response.message };
            } else {
                message.error(response.message || 'Invalid credentials');
                set({ loading: false });
                return { success: false, message: response.message || 'Invalid credentials' };
            }
        } catch (error) {
            console.error('Login failed:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || 'Login failed';
            message.error(errorMessage);
            set({ loading: false });
            return { success: false, message: errorMessage };
        }
    },

    fetchUserProfile: async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                set({ isAuth: false, userProfile: null });
                return;
            }

            const { data: response } = await axios.get(`${API_URL}/users/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.success) {
                set({ 
                    userProfile: response.data,
                    isAuth: true 
                });
            } else {
                localStorage.removeItem('accessToken');
                set({ isAuth: false, userProfile: null });
                message.error(response.message || 'Failed to fetch profile');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error.response?.data || error.message);
            localStorage.removeItem('accessToken');
            set({ isAuth: false, userProfile: null });
            message.error('Failed to fetch profile');
        }
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        set({ isAuth: false, userProfile: null });
        message.success('Logged out successfully');
    },

    changePassword: async (passwordData) => {
        set({ loading: true });
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Access token is missing');
            }

            const { data: response } = await axios.post(`${API_URL}/users/change-password`, passwordData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.success) {
                message.success(response.message || 'Password changed successfully');
                return { success: true, message: response.message };
            } else {
                message.error(response.message || 'Failed to change password');
                return { success: false, message: response.message };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to change password';
            message.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            set({ loading: false });
        }
    }
}));

export default useAuthStore;