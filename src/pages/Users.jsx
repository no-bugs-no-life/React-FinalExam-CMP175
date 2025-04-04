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
                response = await updateUser(editingUser.id, values);
            } else {
                // Thêm người dùng mới
                response = await addUser(values);
            }

            if (response.result) {
                message.success(response.msg || (editingUser ? 'User updated successfully' : 'User added successfully'));
                fetchUsers(); // Làm mới danh sách người dùng
                setModalOpen(false); // Đóng modal
                setEditingUser(null); // Reset trạng thái chỉnh sửa
            } else {
                message.error(response.msg || 'An error occurred while saving the user');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.msg || 'An unexpected error occurred while saving the user';
            message.error(errorMessage);
        }
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Delete User',
            content: `Are you sure you want to delete ${record.firstName} ${record.lastName}?`,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteUser(record.id);
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
            dataIndex: 'id',
            key: 'id',
            width: '100px',
        },
        {
            title: 'First Name',
            dataIndex: 'firstName',
            key: 'firstName',
        },
        {
            title: 'Last Name',
            dataIndex: 'lastName',
            key: 'lastName',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'ACTIVE' : 'INACTIVE'}
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
                    dataSource={users.map((user) => ({ ...user, key: user.id }))} // Thêm key duy nhất cho mỗi hàng
                    pagination={{
                        pageSize: 10,
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