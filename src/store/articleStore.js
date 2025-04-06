import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../configs/api';
import { message } from 'antd';

const useArticleStore = create((set, get) => ({
    articles: [],
    loading: false,
    error: null,
    pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0
    },
    
    fetchArticles: async (page = 1, pageSize = 10, keyword = '') => {
        set({ loading: true, error: null });
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Access token is missing. Please log in again.');
            }
            
            console.log('Fetching articles with params:', { page, pageSize, title: keyword });
            
            // Tạo params object
            const params = { page, pageSize };
            
            // Thay đổi tham số tìm kiếm từ 'q' thành 'title'
            if (keyword && keyword.trim() !== '') {
                params.title = keyword.trim();
            }
            
            const { data: response } = await axios.get(`${API_URL}/admin/articles`, {
                params,
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (response.result) {
                const { items, page: currentPage, pageSize: size, totalItems, totalPages } = response.data;
                
                set({ 
                    articles: items || [], 
                    pagination: {
                        current: parseInt(currentPage) || 1,
                        pageSize: parseInt(size) || 10,
                        total: parseInt(totalItems) || 0,
                        totalPages: parseInt(totalPages) || 0
                    },
                    loading: false,
                    error: null
                });
                
                console.log('Articles loaded successfully:', items?.length || 0, 'items', 'for title:', keyword || '(none)');
            } else {
                message.error(response.msg || 'Failed to fetch articles');
                set({ loading: false, error: response.msg });
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
            message.error(error.response?.data?.msg || 'Failed to fetch articles');
            set({ 
                loading: false, 
                error: error.message,
                articles: [] // Reset articles khi có lỗi
            });
        }
    },
    
    addArticle: async (articleData) => {
        set({ loading: true });
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Access token is missing. Please log in again.');
            }
            
            const { data: response } = await axios.post(`${API_URL}/admin/articles`, articleData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.result) {
                const { current, pageSize } = get().pagination;
                await get().fetchArticles(current, pageSize);
                return response;
            } else {
                message.error(response.msg || 'Failed to add article');
                return response;
            }
        } catch (error) {
            message.error(error.response?.data?.msg || 'Failed to add article');
            throw error;
        } finally {
            set({ loading: false });
        }
    },
    
    updateArticle: async (id, articleData) => {
        set({ loading: true });
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Access token is missing. Please log in again.');
            }
            
            const { data: response } = await axios.put(`${API_URL}/admin/articles/${id}`, articleData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            
            if (response.result) {
                message.success(response.msg || 'Article updated successfully');
                const { current, pageSize } = get().pagination;
                await get().fetchArticles(current, pageSize);
                return response;
            } else {
                message.error(response.msg || 'Failed to update article');
                return response;
            }
        } catch (error) {
            message.error(error.response?.data?.msg || 'Failed to update article');
            throw error;
        } finally {
            set({ loading: false });
        }
    },
    
    deleteArticle: async (id) => {
        set({ loading: true });
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Access token is missing. Please log in again.');
            }
            
            const { data: response } = await axios.delete(`${API_URL}/admin/articles/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (response.result) {
                message.success(response.msg || 'Article deleted successfully');
                const { current, pageSize } = get().pagination;
                await get().fetchArticles(current, pageSize);
                return response;
            } else {
                message.error(response.msg || 'Failed to delete article');
                return response;
            }
        } catch (error) {
            message.error(error.response?.data?.msg || 'Failed to delete article');
            throw error;
        } finally {
            set({ loading: false });
        }
    },
    
    updateArticleStatus: async (id, status) => {
        set({ loading: true });
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Access token is missing. Please log in again.');
            }
            
            const { data: response } = await axios.patch(`${API_URL}/admin/articles/${id}/status`, { status }, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            
            if (response.result) {
                message.success(response.msg || 'Article status updated successfully');
                const { current, pageSize } = get().pagination;
                await get().fetchArticles(current, pageSize);
                return response;
            } else {
                message.error(response.msg || 'Failed to update article status');
                return response;
            }
        } catch (error) {
            message.error(error.response?.data?.msg || 'Failed to update article status');
            throw error;
        } finally {
            set({ loading: false });
        }
    },
}));

export default useArticleStore;