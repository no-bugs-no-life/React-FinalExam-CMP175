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
            const { data: response } = await axios.get(`${API_URL}/categories`, {
                params: { q: keyword },
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.success) {
                set({ 
                    categories: response.data,
                    loading: false 
                });
            } else {
                message.error(response.message || 'Failed to fetch categories');
                set({ loading: false });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch categories';
            message.error(errorMessage);
            set({ loading: false, error: errorMessage });
        }
    },
    
    addCategory: async (categoryData) => {
        set({ loading: true });
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Access token is missing. Please log in again.');
            }
            const { data: response } = await axios.post(`${API_URL}/categories`, categoryData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.success) {
                const fetchCategories = useCategoryStore.getState().fetchCategories;
                await fetchCategories();
                message.success(response.message || 'Category added successfully');
                return response;
            } else {
                message.error(response.message || 'Failed to add category');
                return response;
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to add category';
            message.error(errorMessage);
            throw new Error(errorMessage);
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
            const { data: response } = await axios.put(`${API_URL}/categories/${id}`, categoryData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            if (response.success) {
                message.success(response.message || 'Category updated successfully');
                const fetchCategories = useCategoryStore.getState().fetchCategories;
                await fetchCategories();
                return response;
            } else {
                message.error(response.message || 'Failed to update category');
                return response;
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update category';
            message.error(errorMessage);
            throw new Error(errorMessage);
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
            const { data: response } = await axios.delete(`${API_URL}/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.success) {
                message.success(response.message || 'Category deleted successfully');
                const fetchCategories = useCategoryStore.getState().fetchCategories;
                await fetchCategories();
                return response;
            } else {
                message.error(response.message || 'Failed to delete category');
                return response;
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete category';
            message.error(errorMessage);
            throw new Error(errorMessage);
        } finally {
            set({ loading: false });
        }
    },
}));

export default useCategoryStore;