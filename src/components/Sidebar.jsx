import React from 'react';
import { Layout, Menu } from 'antd';
import {
    DashboardOutlined,
    TeamOutlined,
    ShoppingOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            key: '/',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            type: 'divider',
        },
        {
            key: 'management',
            label: 'Management',
            type: 'group',
            children: [
                {
                    key: '/users',
                    icon: <TeamOutlined />,
                    label: 'Users'
                },
                {
                    key: '/categories',
                    icon: <ShoppingOutlined />,
                    label: 'Categories'
                }
            ]
        }
    ];

    return (
        <Sider
            width={250}
            style={{
                background: '#ffffff',
                borderRight: '1px solid #f0f0f0',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 1000,
                boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)'
            }}
        >
            <div style={{
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '1px solid #f0f0f0'
            }}>
                <span style={{
                    color: '#1890ff',
                    fontSize: '20px',
                    fontWeight: 'bold'
                }}>
                    DevNews Admin
                </span>
            </div>

            <div style={{ height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    style={{
                        border: 'none',
                        padding: '8px'
                    }}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                />
            </div>
        </Sider>
    );
};

export default Sidebar;