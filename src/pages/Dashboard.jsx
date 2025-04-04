import React from 'react';
import { Card, Row, Col, Statistic, Progress, Image, Space } from 'antd';
import { TeamOutlined, FireOutlined, StarOutlined } from '@ant-design/icons';

const Dashboard = () => {
    return (
        <div>
            <h2>Dashboard</h2>
            <Row gutter={[16, 16]}>
                <Col span={8}>
                    <Card hoverable>
                        <Statistic
                            title="Total Devs"
                            value={3}
                            prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                            valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card hoverable>
                        <Statistic
                            title="Stress Rate"
                            value={100}
                            suffix="%"
                            prefix={<FireOutlined style={{ color: '#ff4d4f' }} />}
                            valueStyle={{ color: '#ff4d4f', fontWeight: 'bold' }}
                        />
                        <Progress
                            percent={100}
                            showInfo={false}
                            strokeColor={{ '0%': '#ff4d4f', '100%': '#ff7875' }}
                            style={{ marginTop: 8 }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card 
                        hoverable
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Statistic
                                title="Aura"
                                value={9999999999}
                                prefix={<StarOutlined style={{ color: '#faad14' }} />}
                                suffix="social credit"
                                valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
                            />
                            
                            <div style={{ marginTop: 16, textAlign: 'center' }}>
                                <Image
                                    src="https://media.tenor.com/S6sudnbcFKIAAAAe/social-credit.png"
                                    alt="Social Credit"
                                    preview={false}
                                    style={{ 
                                        maxWidth: '100%', 
                                        maxHeight: '120px',
                                        objectFit: 'contain',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;