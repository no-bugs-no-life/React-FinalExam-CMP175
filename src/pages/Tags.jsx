import React, { useEffect } from 'react';
import { Table, Button, Space, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import useTagStore from '../store/tagStore';
import TagForm from '../components/Form/TagForm';

const Tags = () => {
    const {
        tags,
        loading,
        modalVisible,
        selectedTag,
        fetchTags,
        createTag,
        updateTag,
        deleteTag,
        setModalVisible,
        setSelectedTag
    } = useTagStore();

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    const handleAdd = () => {
        setSelectedTag(null);
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setSelectedTag(record);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        await deleteTag(id);
    };

    const handleSubmit = async (values) => {
        if (selectedTag) {
            await updateTag(selectedTag._id, values);
        } else {
            await createTag(values);
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Tag
                    color={record.bgColor}
                    style={{ color: record.textColor }}
                >
                    {text}
                </Tag>
            )
        },
        {
            title: 'Background Color',
            dataIndex: 'bgColor',
            key: 'bgColor',
            render: (color) => (
                <div
                    style={{
                        width: 30,
                        height: 30,
                        backgroundColor: color,
                        border: '1px solid #d9d9d9',
                        borderRadius: 4
                    }}
                />
            )
        },
        {
            title: 'Text Color',
            dataIndex: 'textColor',
            key: 'textColor',
            render: (color) => (
                <div
                    style={{
                        width: 30,
                        height: 30,
                        backgroundColor: color,
                        border: '1px solid #d9d9d9',
                        borderRadius: 4
                    }}
                />
            )
        },
        {
            title: 'Actions',
            key: 'actions',
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
                        title="Delete Tag"
                        description="Are you sure you want to delete this tag?"
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
            <div style={{ marginBottom: 16 }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Add New Tag
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={tags}
                rowKey="_id"
                loading={loading}
            />

            <TagForm
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onSubmit={handleSubmit}
                initialValues={selectedTag}
                mode={selectedTag ? 'edit' : 'add'}
            />
        </div>
    );
};

export default Tags; 