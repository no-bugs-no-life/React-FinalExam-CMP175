import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../configs/api';
import { message } from 'antd';

const useCategoryStore = create((set) => ({
    categories: [],
    loading: false,
    error: null,
    pagination: {
        current: 1,
        pageSize: 10,
        total: 0
    },
    
    fetchCategories: async (keyword = '') => {
        set({ loading: true });
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Access token is missing. Please log in again.');
            }
            const { data: response } = await axios.get(`${API_URL}/admin/categories`, {
                params: { q: keyword },
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.result) {
                const { items } = response.data;
                set({ categories: items, loading: false });
            } else {
                message.error(response.msg || 'Failed to fetch categories');
                set({ loading: false });
            }
        } catch (error) {
            message.error(error.response?.data?.msg || 'Failed to fetch categories');
            set({ loading: false });
        }
    },
    
    addCategory: async (categoryData) => {
        set({ loading: true });
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Access token is missing. Please log in again.');
            }
            const { data: response } = await axios.post(`${API_URL}/admin/categories`, categoryData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.result) {
                const fetchCategories = useCategoryStore.getState().fetchCategories;
                await fetchCategories();
                return response; // Return the response to handle in the component
            } else {
                message.error(response.msg || 'Failed to add category');
                return response; // Return the response to handle in the component
            }
        } catch (error) {
            message.error(error.response?.data?.msg || 'Failed to add category');
            throw error; // Rethrow the error to handle in the component
        } finally {
            set({ loading: false });
        }
    },
    
    updateCategory: async (id, categoryData) => {
        set({ loading: true });
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Access token is missing. Please log in again.');
            }
            const { data: response } = await axios.put(`${API_URL}/admin/categories/${id}`, categoryData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.result) {
                message.success(response.msg || 'Category updated successfully');
                const fetchCategories = useCategoryStore.getState().fetchCategories;
                await fetchCategories();
            } else {
                message.error(response.msg || 'Failed to update category');
            }
        } catch (error) {
            message.error(error.response?.data?.msg || 'Failed to update category');
        } finally {
            set({ loading: false });
        }
    },
    
    deleteCategory: async (id) => {
        set({ loading: true });
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Access token is missing. Please log in again.');
            }
            const { data: response } = await axios.delete(`${API_URL}/admin/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.result) {
                message.success(response.msg || 'Category deleted successfully');
                const fetchCategories = useCategoryStore.getState().fetchCategories;
                await fetchCategories();
            } else {
                message.error(response.msg || 'Failed to delete category');
            }
        } catch (error) {
            message.error(error.response?.data?.msg || 'Failed to delete category');
        } finally {
            set({ loading: false });
        }
    },
}));

export default useCategoryStore;