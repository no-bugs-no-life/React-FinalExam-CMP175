import React from 'react';
import { Layout } from 'antd';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const { Content } = Layout;

const AdminLayout = ({ children }) => {
    return (
        <Layout>
            <Sidebar />
            <Layout style={{ marginLeft: 250 }}>
                <Navbar />
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 'calc(100vh - 112px)',
                        background: '#fff',
                        borderRadius: '4px'
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;