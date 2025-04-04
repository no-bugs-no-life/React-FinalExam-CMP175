import React, { useEffect } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Login = () => {
    const navigate = useNavigate();
    const { login, loading } = useAuthStore();

    const onFinish = async (values) => {
        try {
            const response = await login({
                email: values.email,
                password: values.password,
            });

            // Check if response has the expected structure
            if (response && response.result === true) {
                const { msg } = response;
                message.success(msg || 'Login successful!');
                navigate('/');
            } else {
                message.error(response?.msg || 'Invalid credentials');
            }
        } catch (error) {
            message.error('Login failed');
            console.error('Login error:', error);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#f0f2f5'
        }}>
            <Card style={{ width: 400, padding: '24px' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <h1 style={{ fontSize: '24px', color: '#1890ff' }}>DDHACK Admin</h1>
                    <p style={{ color: '#666' }}>Welcome back! Please login.</p>
                </div>
                
                <Form
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[{ required: true, message: 'Please input your email!' }]}
                    >
                        <Input 
                            prefix={<UserOutlined />} 
                            placeholder="Email" 
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined />} 
                            placeholder="Password" 
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            block
                            loading={loading}
                        >
                            Log in
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;