import { create } from 'zustand';
import axios from 'axios';
import { message } from 'antd';
import { API_URL } from '../configs/api';

const useAuthStore = create((set, get) => ({
    isAuth: false,
    adminProfile: null,
    loading: false,

    setAuth: (status) => set({ isAuth: status }),

    login: async (encryptedData) => {
        set({ loading: true });
        try {
            const { data: response } = await axios.post(`${API_URL}/v1/auth/login`, {
                email: encryptedData.email,
                password: encryptedData.password
            });

            // Check if the response structure matches the expected format
            if (response.result === true && response.data) {
                const { accessToken, refreshToken } = response.data;

                // Ensure the tokens exist
                if (!accessToken || !refreshToken) {
                    message.error('Missing tokens in response');
                    set({ loading: false });
                    return false;
                }

                // Store tokens securely
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                // Fetch admin profile
                await get().fetchAdminProfile();
                set({ loading: false });
                return { result: true, msg: response.msg };
            } else {
                message.error(response?.msg || 'Invalid credentials');
                set({ loading: false });
                return { result: false, msg: response?.msg || 'Invalid credentials' };
            }
        } catch (error) {
            console.error('Login failed:', error.response?.data || error.message);
            message.error('Login failed');
            set({ loading: false });
            return { result: false, msg: 'Login failed' };
        }
    },
    fetchAdminProfile: async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                set({ isAuth: false, adminProfile: null });
                return;
            }

            const { data: response } = await axios.get(`${API_URL}/v1/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Check if the response structure matches the expected format
            if (response.result === true && response.data) {
                const { data } = response;

                // Set the admin profile and authentication status
                set({ adminProfile: data, isAuth: true });
            } else {
                localStorage.removeItem('accessToken');
                set({ isAuth: false, adminProfile: null });
            }
        } catch (error) {
            console.error('Error fetching admin profile:', error.response?.data || error.message);
            localStorage.removeItem('accessToken');
            set({ isAuth: false, adminProfile: null });
        }
    },
    logout: () => {
        localStorage.removeItem('accessToken');
        set({ isAuth: false, adminProfile: null });
    },
}));

export default useAuthStore;