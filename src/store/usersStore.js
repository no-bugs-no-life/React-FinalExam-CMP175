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
            const token = localStorage.getItem('accessToken'); // Retrieve accessToken
            if (!token) {
                throw new Error('Access token is missing. Please log in again.');
            }
            const { data: response } = await axios.get(`${API_URL}/admin/users`, {
                params: { q: keyword, page, pageSize },
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                },
            });
            if (response.result) {
                const { items, totalItems } = response.data;
                set({
                    users: items,
                    pagination: {
                        current: page,
                        pageSize,
                        total: totalItems,
                    },
                    loading: false,
                });
            } else {
                message.error(response.msg || 'Failed to fetch users');
                set({ loading: false });
            }
        } catch (error) {
            message.error(error.response?.data?.msg || 'Failed to fetch users');
            set({ loading: false });
        }
    },
    
    addUser: async (userData) => {
        set({ loading: true });
        try {
            const token = localStorage.getItem('accessToken'); // Retrieve accessToken
            if (!token) {
                throw new Error('Access token is missing. Please log in again.');
            }
            const { data: response } = await axios.post(`${API_URL}/admin/users`, userData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.result) {
                const fetchUsers = useUsersStore.getState().fetchUsers;
                await fetchUsers(); // Refresh the user list after adding a new user
                return response; // Return the response to handle in the component
            } else {
                message.error(response.msg || 'Failed to add user');
                return response; // Return the response to handle in the component
            }
        } catch (error) {
            message.error(error.response?.data?.msg || 'Failed to add user');
            throw error; // Rethrow the error to handle in the component
        } finally {
            set({ loading: false });
        }
    },
    
    updateUser: async (id, userData) => {
        set({ loading: true });
        try {
            const token = localStorage.getItem('accessToken'); // Retrieve accessToken
            if (!token) {
                throw new Error('Access token is missing. Please log in again.');
            }
            const { data: response } = await axios.put(`${API_URL}/admin/users/${id}`, userData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.result) {
                // Update the local user list with the updated user data
                set((state) => ({
                    users: state.users.map((user) =>
                        user.id === id ? { ...user, ...response.data } : user
                    ),
                    loading: false,
                }));
                message.success(response.msg || 'User updated successfully');
                return response; // Return the response to handle in the component
            } else {
                message.error(response.msg || 'Failed to update user');
                return response; // Return the response to handle in the component
            }
        } catch (error) {
            // Handle errors gracefully
            const errorMessage = error.response?.data?.msg || 'Failed to update user';
            message.error(errorMessage);
            throw new Error(errorMessage); // Rethrow the error to handle in the component
        } finally {
            set({ loading: false });
        }
    },
    
    deleteUser: async (id) => {
        set({ loading: true });
        try {
            const token = localStorage.getItem('accessToken'); // Retrieve accessToken
            if (!token) {
                throw new Error('Access token is missing. Please log in again.');
            }
            const { data: response } = await axios.delete(`${API_URL}/admin/users/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.result) {
                // Update the users list by filtering out the deleted user
                set((state) => ({
                    users: state.users.filter(user => user.id !== id),
                    loading: false
                }));
                message.success(response.msg || 'User deleted successfully');
            } else {
                message.error(response.msg || 'Failed to delete user');
                set({ loading: false });
            }
        } catch (error) {
            message.error(error.response?.data?.msg || 'Failed to delete user');
            set({ error: error.message, loading: false });
        } finally {
            set({ loading: false });
        }
    },
}));

export default useUsersStore;