import React, { useEffect } from 'react';
import { Table, Button, Space, Popconfirm, Input, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import useArticleStore from '../store/articleStore';
import ArticleForm from '../components/Form/ArticleForm';
import dayjs from 'dayjs';

const { Search } = Input;

const Articles = () => {
    const {
        articles,
        loading,
        modalVisible,
        selectedArticle,
        pagination,
        fetchArticles,
        addArticle,
        updateArticle,
        deleteArticle,
        setModalVisible,
        setSelectedArticle,
        setPagination
    } = useArticleStore();

    useEffect(() => {
        fetchArticles(
            pagination.current,
            pagination.pageSize
        );
    }, [fetchArticles, pagination.current, pagination.pageSize]);

    const handleAdd = () => {
        setSelectedArticle(null);
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setSelectedArticle(record);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        await deleteArticle(id);
    };

    const handleSubmit = async (values) => {
        try {
            if (selectedArticle) {
                await updateArticle(selectedArticle._id, values);
            } else {
                await addArticle(values);
            }
            setModalVisible(false);
        } catch (error) {
            console.error('Error submitting article:', error);
        }
    };

    const handleSearch = (value) => {
        fetchArticles(1, pagination.pageSize, value);
    };

    const handleTableChange = (pagination, filters, sorter) => {
        setPagination(pagination);
        fetchArticles(
            pagination.current,
            pagination.pageSize,
            undefined,
            sorter.field,
            sorter.order === 'ascend' ? 'asc' : 'desc'
        );
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            width: '25%',
            render: (text, record) => (
                <div>
                    <div>{text}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{record.slug}</div>
                </div>
            )
        },
        {
            title: 'Category',
            dataIndex: ['category', 'name'],
            key: 'category',
            width: '10%'
        },
        {
            title: 'Tags',
            dataIndex: 'tags',
            key: 'tags',
            width: '15%',
            render: (tags) => (
                <Space size={[0, 4]} wrap>
                    {tags?.map((tag) => (
                        <Tag
                            key={tag._id}
                            color={tag.bgColor}
                            style={{ color: tag.textColor }}
                        >
                            {tag.name}
                        </Tag>
                    ))}
                </Space>
            )
        },
        {
            title: 'Source',
            dataIndex: ['source', 'name'],
            key: 'source',
            width: '10%',
            render: (text, record) => (
                <a href={record.source?.url} target="_blank" rel="noopener noreferrer">
                    {text}
                </a>
            )
        },
        {
            title: 'Published',
            dataIndex: 'publishedAt',
            key: 'publishedAt',
            width: '15%',
            render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
            sorter: true
        },
        {
            title: 'Views',
            dataIndex: 'views',
            key: 'views',
            width: '10%',
            sorter: true
        },
        {
            title: 'Actions',
            key: 'actions',
            width: '15%',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete Article"
                        description="Are you sure you want to delete this article?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Add New Article
                </Button>
                <Search
                    placeholder="Search articles..."
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                    allowClear
                />
            </div>

            <Table
                columns={columns}
                dataSource={articles}
                rowKey="_id"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `Total ${total} articles`
                }}
                onChange={handleTableChange}
            />

            <ArticleForm
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onSubmit={handleSubmit}
                initialValues={selectedArticle}
                mode={selectedArticle ? 'edit' : 'add'}
            />
        </div>
    );
};

export default Articles;