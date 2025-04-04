'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Input, Badge, Avatar, Dropdown, Space, Modal, Button } from 'antd';
import {
    BellOutlined,
    SearchOutlined,
    UserOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import useAuthStore from '../store/authStore'; // Cập nhật path đúng với dự án bạn

const { Header } = Layout;

const Navbar = () => {
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);

    const {
        adminProfile,
        isAuth,
        fetchAdminProfile,
        logout,
    } = useAuthStore();

    // Fetch profile nếu đang auth nhưng chưa có profile
    useEffect(() => {
        if (isAuth && !adminProfile) {
            fetchAdminProfile();
        }
    }, [isAuth, adminProfile, fetchAdminProfile]);

    const handleLogout = () => {
        logout();
        window.location.href = '/login'; // redirect sau khi logout
    };

    const handleViewProfile = () => {
        setProfileModalOpen(true);
    };

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Profile',
            onClick: handleViewProfile,
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: handleLogout,
        },
    ];

    return (
        <>
            <Header style={{
                background: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                padding: '0 24px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ flex: 1, maxWidth: '500px' }}>
                    <Input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        placeholder="Search..."
                        style={{
                            borderRadius: '6px',
                            backgroundColor: '#f5f5f5',
                            border: 'none'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Badge count={5} dot color="#1890ff">
                        <BellOutlined
                            style={{
                                fontSize: '20px',
                                color: '#595959',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px'
                            }}
                            className="hover:bg-gray-100"
                        />
                    </Badge>

                    <Dropdown
                        menu={{ items: userMenuItems }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Space style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: '4px' }} className="hover:bg-gray-100">
                            <Avatar
                                size="medium"
                                icon={<UserOutlined />}
                                style={{ backgroundColor: '#1890ff' }}
                            />
                            <span style={{ color: '#262626', marginLeft: '8px' }} className="hidden sm:inline">
                                {adminProfile?.firstName || 'Admin'}
                            </span>
                        </Space>
                    </Dropdown>
                </div>
            </Header>

            <Modal
                title="Profile Details"
                open={isProfileModalOpen}
                onCancel={() => setProfileModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setProfileModalOpen(false)}>
                        Close
                    </Button>
                ]}
            >
                <p><strong>Name:</strong> {adminProfile?.firstName || 'N/A'}</p>
                <p><strong>Email:</strong> {adminProfile?.email || 'N/A'}</p>
            </Modal>
        </>
    );
};

export default Navbar;
