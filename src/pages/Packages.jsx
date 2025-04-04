import React, { useState, useEffect, useMemo } from 'react';
import { Table, Card, Button, Input, Space, Modal } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import debounce from 'lodash/debounce';
import PackageForm from '../components/Form/PackageForm';
import usePackageStore from '../store/packageStore';
import PackageKeys from '../components/PackageKeys';

const Packages = () => {
    const [searchText, setSearchText] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [keyModalOpen, setKeyModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);

    const packages = usePackageStore((state) => state.packages);
    const loading = usePackageStore((state) => state.loading);
    const fetchPackages = usePackageStore((state) => state.fetchPackages);
    const addPackage = usePackageStore((state) => state.addPackage);
    const updatePackage = usePackageStore((state) => state.updatePackage);
    const deletePackage = usePackageStore((state) => state.deletePackage);

    const debouncedSearch = useMemo(
        () => debounce((value) => {
            fetchPackages(value);
        }, 300),
        [fetchPackages]
    );

    const handleSearch = (e) => {
        setSearchText(e.target.value);
        debouncedSearch(e.target.value);
    };

    useEffect(() => {
        fetchPackages();
    }, [fetchPackages]);

    const handleEdit = (record) => {
        setEditingPackage(record);
        setModalOpen(true);
    };

    const handleAdd = () => {
        setEditingPackage(null);
        setModalOpen(true);
    };

    const handleFormSubmit = async (values) => {
        if (editingPackage) {
            await updatePackage(editingPackage.id, values);
        } else {
            await addPackage(values);
        }
        setModalOpen(false);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Delete Package',
            content: `Are you sure you want to delete ${record.name}?`,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => deletePackage(record.key)
        });
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'key',
            key: 'id',
            width: '250px',
            ellipsis: true,
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
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(price),
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
                    <Button
                        onClick={() => {
                            setSelectedPackage(record);
                            setKeyModalOpen(true);
                        }}
                    >
                        Manage Keys
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Card
                title="Packages Management"
                extra={
                    <Space>
                        <Input
                            placeholder="Search packages..."
                            prefix={<SearchOutlined />}
                            onChange={handleSearch}
                            style={{ width: 200 }}
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                        >
                            Add Package
                        </Button>
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={packages}
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                />
            </Card>

            <PackageForm
                open={isModalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    setEditingPackage(null);
                }}
                onSubmit={handleFormSubmit}
                initialValues={editingPackage}
                mode={editingPackage ? 'edit' : 'add'}
            />
            
            <PackageKeys
                open={keyModalOpen}
                onCancel={() => {
                    setKeyModalOpen(false);
                    setSelectedPackage(null);
                }}
                packageId={selectedPackage?.id}
                packageName={selectedPackage?.name}
            />
        </div>
    );
};

export default Packages;