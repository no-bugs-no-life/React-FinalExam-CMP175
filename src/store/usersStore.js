import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../configs/api';
import { message } from 'antd';

const useUsersStore = create((set) => ({
    users: [],
    loading: false,
    error: null,
    pagination: {
        current: 1,
        pageSize: 10,
        total: 0
    },
    
    fetchUsers: async (keyword = '', page = 1, pageSize = 10) => {
        set({ loading: true });
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Access token is missing. Please log in again.');
            }
            const { data: response } = await axios.get(`${API_URL}/users`, {
                params: { q: keyword, page, pageSize },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.success) {
                set({
                    users: response.data,
                    pagination: {
                        current: page,
                        pageSize,
                        total: response.data.length,
                    },
                    loading: false,
                });
            } else {
                message.error(response.message || 'Failed to fetch users');
                set({ loading: false });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch users';
            message.error(errorMessage);
            set({ loading: false, error: errorMessage });
        }
    },
    
    addUser: async (userData) => {
        set({ loading: true });
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Access token is missing. Please log in again.');
            }
            const { data: response } = await axios.post(`${API_URL}/users/register`, userData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.success) {
                const fetchUsers = useUsersStore.getState().fetchUsers;
                await fetchUsers();
                message.success(response.message || 'User added successfully');
                return response;
            } else {
                message.error(response.message || 'Failed to add user');
                return response;
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to add user';
            message.error(errorMessage);
            throw new Error(errorMessage);
        } finally {
            set({ loading: false });
        }
    },
    
    updateUser: async (id, userData) => {
        set({ loading: true });
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Access token is missing. Please log in again.');
            }
            const { data: response } = await axios.put(`${API_URL}/users/${id}`, userData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.success) {
                set((state) => ({
                    users: state.users.map((user) =>
                        user._id === id ? { ...user, ...response.data } : user
                    ),
                    loading: false,
                }));
                message.success(response.message || 'User updated successfully');
                return response;
            } else {
                message.error(response.message || 'Failed to update user');
                return response;
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update user';
            message.error(errorMessage);
            throw new Error(errorMessage);
        } finally {
            set({ loading: false });
        }
    },
    
    deleteUser: async (id) => {
        set({ loading: true });
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Access token is missing. Please log in again.');
            }
            const { data: response } = await axios.delete(`${API_URL}/users/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.success) {
                set((state) => ({
                    users: state.users.filter(user => user._id !== id),
                    loading: false
                }));
                message.success(response.message || 'User deleted successfully');
            } else {
                message.error(response.message || 'Failed to delete user');
                set({ loading: false });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete user';
            message.error(errorMessage);
            set({ error: errorMessage, loading: false });
        } finally {
            set({ loading: false });
        }
    },
}));

export default useUsersStore;