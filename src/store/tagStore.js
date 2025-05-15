import { create } from 'zustand';
import { message } from 'antd';
import axios from 'axios';
import { API_URL } from '../configs/api';

const useTagStore = create((set) => ({
    tags: [],
    loading: false,
    selectedTag: null,
    modalVisible: false,

    setModalVisible: (visible) => {
        if (!visible) {
            set({ selectedTag: null });
        }
        set({ modalVisible: visible });
    },
    
    setSelectedTag: (tag) => set({ selectedTag: tag }),

    fetchTags: async () => {
        try {
            set({ loading: true });
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(`${API_URL}/tags`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                set({ tags: response.data.data });
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
            message.error('Failed to fetch tags');
        } finally {
            set({ loading: false });
        }
    },

    createTag: async (tagData) => {
        try {
            set({ loading: true });
            const token = localStorage.getItem('accessToken');
            const response = await axios.post(`${API_URL}/tags`, tagData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                message.success('Tag created successfully');
                set((state) => ({
                    tags: [...state.tags, response.data.data],
                    modalVisible: false
                }));
            }
        } catch (error) {
            console.error('Error creating tag:', error);
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else {
                message.error('Failed to create tag');
            }
        } finally {
            set({ loading: false });
        }
    },

    updateTag: async (id, tagData) => {
        try {
            set({ loading: true });
            const token = localStorage.getItem('accessToken');
            console.log('Updating tag with data:', { id, tagData });
            const response = await axios.put(`${API_URL}/tags/${id}`, tagData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                message.success('Tag updated successfully');
                set((state) => ({
                    tags: state.tags.map((tag) =>
                        tag._id === id ? { ...tag, ...response.data.data } : tag
                    ),
                    modalVisible: false,
                    selectedTag: null
                }));
            }
        } catch (error) {
            console.error('Error updating tag:', error);
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else {
                message.error('Failed to update tag');
            }
        } finally {
            set({ loading: false });
        }
    },

    deleteTag: async (id) => {
        try {
            set({ loading: true });
            const token = localStorage.getItem('accessToken');
            const response = await axios.delete(`${API_URL}/tags/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                message.success('Tag deleted successfully');
                set((state) => ({
                    tags: state.tags.filter((tag) => tag._id !== id)
                }));
            }
        } catch (error) {
            console.error('Error deleting tag:', error);
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else {
                message.error('Failed to delete tag');
            }
        } finally {
            set({ loading: false });
        }
    }
}));

export default useTagStore; 