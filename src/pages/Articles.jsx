import React, { useState, useEffect, useMemo } from 'react';
import { Table, Card, Button, Input, Space, Modal, message, Badge, Tooltip, Tag, Select } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import debounce from 'lodash/debounce';
import useArticleStore from '../store/articleStore';
import dayjs from 'dayjs';
import ArticleForm from '../components/Form/ArticleForm';

const Articles = () => {
    const [searchText, setSearchText] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [viewingArticle, setViewingArticle] = useState(null);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [selectedArticleId, setSelectedArticleId] = useState(null);
    
    // Dùng một tham số duy nhất để tìm kiếm
    const [searchKeyword, setSearchKeyword] = useState('');

    const articles = useArticleStore((state) => state.articles);
    const loading = useArticleStore((state) => state.loading);
    const pagination = useArticleStore((state) => state.pagination);
    const fetchArticles = useArticleStore((state) => state.fetchArticles);
    const addArticle = useArticleStore((state) => state.addArticle);
    const updateArticle = useArticleStore((state) => state.updateArticle);
    const deleteArticle = useArticleStore((state) => state.deleteArticle);
    const updateArticleStatus = useArticleStore((state) => state.updateArticleStatus);
    const error = useArticleStore((state) => state.error);
    
    // Cải thiện debounce search
    const debouncedSearch = useMemo(
        () => debounce((value) => {
            console.log('Executing search with keyword:', value);
            setSearchKeyword(value);
        }, 500),
        []
    );

    // Gọi API khi searchKeyword hoặc pagination thay đổi
    useEffect(() => {
        console.log('Fetching articles with keyword:', searchKeyword);
        fetchArticles(pagination.current, pagination.pageSize, searchKeyword);
    }, [fetchArticles, searchKeyword, pagination.current, pagination.pageSize]);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchText(value);
        debouncedSearch(value);
    };

    const clearSearch = () => {
        setSearchText('');
        setSearchKeyword('');
    };

    const handleAdd = () => {
        setEditingArticle(null);
        setModalOpen(true);
    };
    
    const handleFormSubmit = async (values) => {
        try {
            if (editingArticle) {
                await updateArticle(editingArticle.id, values);
                message.success('Article updated successfully');
                setModalOpen(false);
            } else {
                const response = await addArticle(values);
                if (response && response.result) {
                    message.success(response.msg || 'Article added successfully');
                    setModalOpen(false);
                } else {
                    message.error((response && response.msg) || 'Failed to add article');
                }
            }
        } catch (error) {
            console.error('Error submitting article:', error);
            message.error('Failed to save article');
        }
    };

    const handleEdit = (record) => {
        setEditingArticle(record);
        setModalOpen(true);
    };

    const handleView = (article) => {
        setViewingArticle(article);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Delete Article',
            content: `Are you sure you want to delete "${record.title}"?`,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteArticle(record.id);
                } catch (error) {
                    message.error('Failed to delete article');
                }
            }
        });
    };

    const showStatusModal = (articleId) => {
        const article = articles.find(a => a.id === articleId);
        setSelectedArticleId(articleId);
        setSelectedStatus(article?.status || 0);
        setStatusModalVisible(true);
    };

    const handleStatusChange = (value) => {
        setSelectedStatus(value);
    };

    const handleStatusUpdate = async () => {
        if (selectedStatus !== null && selectedArticleId) {
            try {
                await updateArticleStatus(selectedArticleId, selectedStatus);
                setStatusModalVisible(false);
                setSelectedStatus(null);
                setSelectedArticleId(null);
            } catch (error) {
                message.error('Failed to update status');
            }
        } else {
            message.warning('Please select a status');
        }
    };

    // Hiển thị trạng thái bài viết
    const getStatusBadge = (status) => {
        switch (Number(status)) {
            case 0:
                return <Badge status="warning" text="Pending" />;
            case 1:
                return <Badge status="success" text="Approved" />;
            case 2:
                return <Badge status="error" text="Rejected" />;
            default:
                return <Badge status="default" text="Unknown" />;
        }
    };

    // Cấu hình cột
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: '70px',
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
            render: (text, record) => (
                <a onClick={() => handleView(record)}>{text}</a>
            ),
            sorter: (a, b) => a.title.localeCompare(b.title),
        },
        {
            title: 'Author',
            dataIndex: 'authorId',
            key: 'authorId',
            width: '120px',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: '100px',
            render: (status) => getStatusBadge(status),
            filters: [
                { text: 'Pending', value: 0 },
                { text: 'Approved', value: 1 },
                { text: 'Rejected', value: 2 },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '150px',
            render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-',
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: '180px',
            render: (_, record) => (
                <Space>
                    <Tooltip title="View">
                        <Button 
                            type="text" 
                            icon={<EyeOutlined />} 
                            onClick={() => handleView(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Change Status">
                        <Button
                            type="text"
                            icon={record.status === 1 ? <CheckOutlined /> : <CloseOutlined />}
                            onClick={() => showStatusModal(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => handleDelete(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Card
                title="Articles Management"
                extra={
                    <Space>
                        <Input
                            placeholder="Search articles by title..."
                            prefix={<SearchOutlined />}
                            onChange={handleSearch}
                            style={{ width: 240 }}
                            value={searchText}
                            allowClear
                            onClear={clearSearch}
                            onPressEnter={() => {
                                // Tìm kiếm ngay khi nhấn Enter
                                setSearchKeyword(searchText);
                            }}
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                        >
                            Add Article
                        </Button>
                    </Space>
                }
            >
                {error && (
                    <div style={{ marginBottom: 16, color: 'red' }}>
                        Error loading articles: {error}
                    </div>
                )}
                
                {searchKeyword && (
                    <div style={{ marginBottom: 16 }}>
                        <span>
                            Search results for: <Tag color="blue">{searchKeyword}</Tag>
                            {' '}
                            <Button 
                                type="link" 
                                onClick={clearSearch}
                            >
                                Clear search
                            </Button>
                        </span>
                    </div>
                )}
                
                <Table
                    columns={columns}
                    dataSource={articles}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: pagination?.current || 1,
                        pageSize: pagination?.pageSize || 10,
                        total: pagination?.total || 0,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} articles`,
                        onChange: (page, pageSize) => {
                            // Khi thay đổi trang hoặc pageSize, cập nhật state
                            const newPagination = { 
                                ...pagination, 
                                current: page, 
                                pageSize: pageSize 
                            };
                            useArticleStore.setState({ pagination: newPagination });
                        }
                    }}
                />
            </Card>

            {/* Form thêm/sửa bài viết */}
            <ArticleForm
                open={isModalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    setEditingArticle(null);
                }}
                onSubmit={handleFormSubmit}
                initialValues={editingArticle}
                mode={editingArticle ? 'edit' : 'add'}
            />

            {/* Modal xem chi tiết bài viết */}
            <Modal
                title={viewingArticle?.title}
                open={!!viewingArticle}
                onCancel={() => setViewingArticle(null)}
                footer={[
                    <Button key="close" onClick={() => setViewingArticle(null)}>
                        Close
                    </Button>
                ]}
                width={800}
            >
                {viewingArticle && (
                    <div>
                        <p><strong>ID:</strong> {viewingArticle.id}</p>
                        <p><strong>Status:</strong> {getStatusBadge(viewingArticle.status)}</p>
                        <p><strong>Author:</strong> {viewingArticle.authorId}</p>
                        {viewingArticle.createdAt && (
                            <p><strong>Created:</strong> {dayjs(viewingArticle.createdAt).format('YYYY-MM-DD HH:mm:ss')}</p>
                        )}
                        {viewingArticle.updatedAt && (
                            <p><strong>Updated:</strong> {dayjs(viewingArticle.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</p>
                        )}
                        
                        {viewingArticle.image && (
                            <div style={{ marginBottom: '20px' }}>
                                <img 
                                    src={viewingArticle.image} 
                                    alt={viewingArticle.title}
                                    style={{ maxWidth: '100%', maxHeight: '300px' }}
                                />
                            </div>
                        )}
                        
                        <div className="article-content" dangerouslySetInnerHTML={{ __html: viewingArticle.content }} />
                    </div>
                )}
            </Modal>

            {/* Modal thay đổi trạng thái */}
            <Modal
                title="Change Article Status"
                open={statusModalVisible}
                onOk={handleStatusUpdate}
                onCancel={() => {
                    setStatusModalVisible(false);
                    setSelectedStatus(null);
                }}
            >
                <Select
                    placeholder="Select new status"
                    style={{ width: '100%' }}
                    onChange={handleStatusChange}
                    value={selectedStatus}
                >
                    <Select.Option value={0}>Pending</Select.Option>
                    <Select.Option value={1}>Approved</Select.Option>
                    <Select.Option value={2}>Rejected</Select.Option>
                </Select>
            </Modal>
        </div>
    );
};

export default Articles;