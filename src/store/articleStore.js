import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../configs/api';
import { message } from 'antd';

const useArticleStore = create((set, get) => ({
    articles: [],
    loading: false,
    selectedArticle: null,
    modalVisible: false,
    pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0
    },
    
    setModalVisible: (visible) => {
        if (!visible) {
            set({ selectedArticle: null });
        }
        set({ modalVisible: visible });
    },
    
    setSelectedArticle: (article) => set({ selectedArticle: article }),

    setPagination: (pagination) => set({ pagination }),

    fetchArticles: async (page = 1, pageSize = 10, keyword = '') => {
        set({ loading: true, error: null });
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Access token is missing. Please log in again.');
            }
            
            console.log('Fetching articles with params:', { page, pageSize, title: keyword });
            
            const params = {
                'page': page,
                'limit': pageSize
            };
            
            if (keyword && keyword.trim() !== '') {
                params.title = keyword.trim();
            }
            
            const { data: response } = await axios.get(`${API_URL}/articles`, {
                params,
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (response.success) {
                const { articles, pagination } = response.data;
                
                set({ 
                    articles: articles || [], 
                    pagination: {
                        current: parseInt(pagination.page) || 1,
                        pageSize: parseInt(pagination.limit) || 10,
                        total: parseInt(pagination.total) || 0,
                        totalPages: parseInt(pagination.totalPages) || 0
                    },
                    loading: false,
                    error: null
                });
                
                console.log('Articles loaded successfully:', articles?.length || 0, 'items');
            } else {
                message.error(response.message || 'Failed to fetch articles');
                set({ loading: false, error: response.message });
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
            message.error(error.response?.data?.message || 'Failed to fetch articles');
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
            
            const { data: response } = await axios.post(`${API_URL}/articles`, articleData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.success) {
                message.success(response.message || 'Article created successfully');
                const newArticle = response.data;
                set(state => ({
                    articles: [newArticle, ...state.articles]
                }));
                set({ modalVisible: false });
                return response.data;
            } else {
                message.error(response.message || 'Failed to add article');
                return null;
            }
        } catch (error) {
            console.error('Error adding article:', error);
            message.error(error.response?.data?.message || 'Failed to add article');
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
            
            const { data: response } = await axios.put(`${API_URL}/articles/${id}`, articleData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            
            if (response.success) {
                message.success(response.message || 'Article updated successfully');
                const updatedArticle = response.data;
                set(state => ({
                    articles: state.articles.map(article => 
                        article._id === id ? updatedArticle : article
                    )
                }));
                set({ modalVisible: false });
                return response.data;
            } else {
                message.error(response.message || 'Failed to update article');
                return null;
            }
        } catch (error) {
            console.error('Error updating article:', error);
            message.error(error.response?.data?.message || 'Failed to update article');
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
            
            const { data: response } = await axios.delete(`${API_URL}/articles/${id}`, {
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
            
            const { data: response } = await axios.patch(`${API_URL}/articles/${id}/status`, { status }, {
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