import React, { useState, useEffect, useMemo } from 'react';
import { Table, Card, Button, Input, Space, Tag, Modal, message } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import debounce from 'lodash/debounce';
import UsersForm from '../components/Form/UsersForm';
import useUsersStore from '../store/usersStore';

const Users = () => {
    const [searchText, setSearchText] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const users = useUsersStore((state) => state.users);
    const loading = useUsersStore((state) => state.loading);
    const pagination = useUsersStore((state) => state.pagination);
    const fetchUsers = useUsersStore((state) => state.fetchUsers);
    const addUser = useUsersStore((state) => state.addUser);
    const updateUser = useUsersStore((state) => state.updateUser);
    const deleteUser = useUsersStore((state) => state.deleteUser);

    // Debounce search input để giảm số lần gọi API
    const debouncedSearch = useMemo(
        () => debounce((value) => {
            fetchUsers(value);
        }, 300),
        [fetchUsers]
    );

    const handleSearch = (e) => {
        setSearchText(e.target.value);
        debouncedSearch(e.target.value);
    };

    useEffect(() => {
        fetchUsers(); // Lấy danh sách người dùng khi component được mount
    }, [fetchUsers]);

    const handleEdit = (record) => {
        setEditingUser(record); // Set giá trị người dùng cần chỉnh sửa
        setModalOpen(true); // Mở modal
    };

    const handleAdd = () => {
        setEditingUser(null); // Xóa giá trị người dùng đang chỉnh sửa
        setModalOpen(true); // Mở modal
    };

    const handleFormSubmit = async (values) => {
        try {
            let response;
            if (editingUser) {
                // Cập nhật người dùng
                response = await updateUser(editingUser._id, values);
            } else {
                // Thêm người dùng mới
                response = await addUser(values);
            }

            if (response.success) {
                message.success(response.message || (editingUser ? 'User updated successfully' : 'User added successfully'));
                fetchUsers(); // Làm mới danh sách người dùng
                setModalOpen(false); // Đóng modal
                setEditingUser(null); // Reset trạng thái chỉnh sửa
            } else {
                message.error(response.message || 'An error occurred while saving the user');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An unexpected error occurred while saving the user';
            message.error(errorMessage);
        }
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Delete User',
            content: `Are you sure you want to delete ${record.name}?`,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteUser(record._id);
                    message.success('User deleted successfully');
                    fetchUsers(); // Làm mới danh sách người dùng sau khi xóa
                } catch (error) {
                    message.error('Failed to delete user');
                }
            }
        });
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: '_id',
            key: '_id',
            width: '100px',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === 'admin' ? 'red' : 'blue'}>
                    {role.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'active',
            key: 'active',
            render: (active) => (
                <Tag color={active ? 'green' : 'red'}>
                    {active ? 'ACTIVE' : 'INACTIVE'}
                </Tag>
            ),
        },
        {
            title: 'Auth Provider',
            dataIndex: 'authProvider',
            key: 'authProvider',
            render: (provider) => (
                <Tag color={provider === 'google' ? 'blue' : 'default'}>
                    {provider.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleDelete(record)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Card
                title="Users Management"
                extra={
                    <Space>
                        <Input
                            placeholder="Search users..."
                            prefix={<SearchOutlined />}
                            onChange={handleSearch}
                            style={{ width: 200 }}
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                        >
                            Add User
                        </Button>
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={users.map((user) => ({ ...user, key: user._id }))} // Thêm key duy nhất cho mỗi hàng
                    pagination={{
                        ...pagination,
                        onChange: (page, pageSize) => {
                            fetchUsers(searchText, page, pageSize);
                        },
                    }}
                    loading={loading}
                />
            </Card>

            <UsersForm
                open={isModalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    setEditingUser(null);
                }}
                onSubmit={handleFormSubmit}
                initialValues={editingUser}
                mode={editingUser ? 'edit' : 'add'}
            />
        </div>
    );
};

export default Users;