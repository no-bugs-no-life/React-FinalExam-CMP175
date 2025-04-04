import React, { useState, useEffect, useMemo } from 'react';
import { Table, Card, Button, Input, Space, Modal, message } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import debounce from 'lodash/debounce';
import CategoryForm from '../components/Form/CategoryForm';
import useCategoryStore from '../store/categoryStore';


const Categories = () => {
    const [searchText, setSearchText] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const categories = useCategoryStore((state) => state.categories);
    const loading = useCategoryStore((state) => state.loading);
    const fetchCategories = useCategoryStore((state) => state.fetchCategories);
    const addCategory = useCategoryStore((state) => state.addCategory);
    const updateCategory = useCategoryStore((state) => state.updateCategory);
    const deleteCategory = useCategoryStore((state) => state.deleteCategory);

    const debouncedSearch = useMemo(
        () => debounce((value) => {
            fetchCategories(value);
        }, 300),
        [fetchCategories]
    );

    const handleSearch = (e) => {
        setSearchText(e.target.value);
        debouncedSearch(e.target.value);
    };

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleEdit = (record) => {
        setEditingCategory(record);
        setModalOpen(true);
    };

    const handleAdd = () => {
        setEditingCategory(null);
        setModalOpen(true);
    };

    const handleFormSubmit = async (values) => {
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, values);
                message.success('Category updated successfully');
            } else {
                const response = await addCategory(values);
                if (response.result) {
                    message.success(response.msg || 'Category added successfully');
                } else {
                    message.error(response.msg || 'Failed to add category');
                }
            }
            setModalOpen(false);
        } catch (error) {
            message.error('Failed to save category');
        }
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Delete Category',
            content: `Are you sure you want to delete ${record.name}?`,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteCategory(record.id);
                    message.success('Category deleted successfully');
                } catch (error) {
                    message.error('Failed to delete category');
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
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) => {
                return String(record.name).toLowerCase().includes(value.toLowerCase());
            },
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
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
                title="Categories Management"
                extra={
                    <Space>
                        <Input
                            placeholder="Search categories..."
                            prefix={<SearchOutlined />}
                            onChange={handleSearch}
                            style={{ width: 200 }}
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                        >
                            Add Category
                        </Button>
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={categories}
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                />
            </Card>

            <CategoryForm
                open={isModalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    setEditingCategory(null);
                }}
                onSubmit={handleFormSubmit}
                initialValues={editingCategory}
                mode={editingCategory ? 'edit' : 'add'}
            />
        </div>
    );
};

export default Categories;