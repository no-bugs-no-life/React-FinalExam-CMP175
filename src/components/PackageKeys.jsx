import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, Form, Input, Badge } from 'antd';
import usePackageKeyStore from '../store/packageKeyStore';
import { DeleteOutlined } from '@ant-design/icons';

const PackageKeys = ({ open, onCancel, packageId, packageName }) => {
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [form] = Form.useForm();
    
    const keys = usePackageKeyStore((state) => state.keys);
    const loading = usePackageKeyStore((state) => state.loading);
    const fetchKeys = usePackageKeyStore((state) => state.fetchKeys);
    const createKey = usePackageKeyStore((state) => state.createKey);
    const deleteKey = usePackageKeyStore((state) => state.deleteKey);

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Delete Key',
            content: `Are you sure you want to delete this key?`,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => deleteKey(packageId, record.id)
        });
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: '250px',
            ellipsis: true,
        },
        {
            title: 'Content',
            dataIndex: 'content',
            key: 'content',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Purchased',
            dataIndex: 'is_purchased',
            key: 'is_purchased',
            render: (isPurchased) => (
                <Badge 
                    status={isPurchased ? 'success' : 'default'} 
                    text={isPurchased ? 'Yes' : 'No'}
                />
            ),
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => new Date(date).toLocaleString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => handleDelete(record)}
                />
            ),
        }
    ];

    useEffect(() => {
        if (open && packageId) {
            fetchKeys(packageId);
        }
    }, [open, packageId, fetchKeys]);

    const handleCreateKey = async (values) => {
        const success = await createKey(packageId, values);
        if (success) {
            setCreateModalOpen(false);
            form.resetFields();
        }
    };

    return (
        <>
            <Modal
                open={open}
                title={`Keys for Package: ${packageName}`}
                onCancel={onCancel}
                width={800}
                footer={[
                    <Button 
                        key="create" 
                        type="primary" 
                        onClick={() => setCreateModalOpen(true)}
                    >
                        Create Key
                    </Button>,
                    <Button key="close" onClick={onCancel}>
                        Close
                    </Button>
                ]}
            >
                <Table
                    columns={columns}
                    dataSource={keys || []}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Modal>

            <Modal
                open={isCreateModalOpen}
                title="Create New Key"
                onCancel={() => setCreateModalOpen(false)}
                onOk={() => form.submit()}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateKey}
                >
                    <Form.Item
                        name="content"
                        label="Content"
                        rules={[{ required: true, message: 'Please input content!' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default PackageKeys;