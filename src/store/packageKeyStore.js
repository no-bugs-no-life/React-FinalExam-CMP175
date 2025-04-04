import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../configs/api';
import { message } from 'antd';

const usePackageKeyStore = create((set) => ({
    keys: [],
    loading: false,
    error: null,
    pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
    },

    fetchKeys: async (packageId) => {
        set({ loading: true });
        try {
            const token = localStorage.getItem('accessToken');
            const { data: response } = await axios.get(`${API_URL}/admin/packages/${packageId}/keys`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status) {
                const { data, pagination } = response.data;
                const formattedKeys = data.map(key => ({
                    ...key,
                    key: key.id
                }));
                set({ 
                    keys: formattedKeys, 
                    pagination: {
                        current: pagination.page,
                        pageSize: pagination.limit,
                        total: pagination.total,
                        totalPages: pagination.totalPages,
                        hasNext: pagination.hasNext,
                        hasPrev: pagination.hasPrev
                    },
                    loading: false 
                });
            }
        } catch (error) {
            message.error('Failed to fetch keys');
            set({ error: error.message, loading: false });
        }
    },

    createKey: async (packageId, keyData) => {
        set({ loading: true });
        try {
            const token = localStorage.getItem('accessToken');
            const { data: response } = await axios.post(`${API_URL}/admin/packages/${packageId}/keys`, {
                ...keyData,
                package_id: packageId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.status) {
                message.success('Key created successfully');
                const fetchKeys = usePackageKeyStore.getState().fetchKeys;
                await fetchKeys(packageId);
                return true;
            }
            return false;
        } catch (error) {
            message.error('Failed to create key');
            set({ error: error.message, loading: false });
            return false;
        }
    },
    deleteKey: async (packageId, keyId) => {
        set({ loading: true });
        try {
            const token = localStorage.getItem('accessToken');
            const { data: response } = await axios.delete(`${API_URL}/admin/keys/${keyId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status) {
                message.success('Key deleted successfully');
                const fetchKeys = usePackageKeyStore.getState().fetchKeys;
                await fetchKeys(packageId);
                return true;
            }
            return false;
        } catch (error) {
            message.error('Failed to delete key');
            set({ error: error.message, loading: false });
            return false;
        }
    }
}));

export default usePackageKeyStore;