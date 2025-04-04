import React, { useEffect } from 'react';
import { Form, Input, Select, Modal, message } from 'antd';

const UsersForm = ({ open, onCancel, onSubmit, initialValues, mode = 'add' }) => {
    const [form] = Form.useForm();

    // Đảm bảo form được reset khi initialValues thay đổi
    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
            }
        }
    }, [open, initialValues, form]);

    const handleSubmit = () => {
        form.validateFields()
            .then((values) => {
                const payload = {
                    email: values.email,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    ...(mode === 'add' && { password: values.password }),
                    phoneNumber: values.phoneNumber || null,
                    role: values.role,
                    isActive: values.isActive,
                };

                onSubmit(payload);
                // Không cần reset form ở đây vì Modal sẽ unmount
            })
            .catch((info) => {
                console.error('Validation Failed:', info);
                message.error('Please correct the errors in the form.');
            });
    };

    // Đảm bảo form được reset khi Modal đóng
    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            open={open}
            title={mode === 'add' ? 'Add New User' : 'Edit User'}
            okText={mode === 'add' ? 'Create' : 'Update'}
            cancelText="Cancel"
            onCancel={handleCancel}
            onOk={handleSubmit}
            width={600}
            destroyOnClose={true} // Quan trọng: hủy Modal khi đóng
        >
            <Form
                form={form}
                layout="vertical"
                preserve={false} // Quan trọng: không giữ lại trạng thái form khi unmount
            >
                {mode === 'edit' && (
                    <Form.Item name="id" label="ID">
                        <Input disabled />
                    </Form.Item>
                )}

                <Form.Item
                    name="firstName"
                    label="First Name"
                    rules={[{ required: true, message: 'Please input first name!' }]}
                >
                    <Input placeholder="Enter first name" />
                </Form.Item>

                <Form.Item
                    name="lastName"
                    label="Last Name"
                    rules={[{ required: true, message: 'Please input last name!' }]}
                >
                    <Input placeholder="Enter last name" />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: 'Please input email!' },
                        { type: 'email', message: 'Please enter a valid email!' },
                    ]}
                >
                    <Input placeholder="Enter email address" />
                </Form.Item>

                {mode === 'add' && (
                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                            { required: true, message: 'Please input password!' },
                            { min: 6, message: 'Password must be at least 6 characters!' },
                        ]}
                    >
                        <Input.Password placeholder="Enter password" />
                    </Form.Item>
                )}

                <Form.Item name="phoneNumber" label="Phone Number">
                    <Input placeholder="Enter phone number (optional)" />
                </Form.Item>

                <Form.Item
                    name="role"
                    label="Role"
                    rules={[{ required: true, message: 'Please select role!' }]}
                >
                    <Select placeholder="Select role">
                        <Select.Option key="user" value="user">User</Select.Option>
                        <Select.Option key="admin" value="admin">Admin</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="isActive"
                    label="Status"
                    rules={[{ required: true, message: 'Please select status!' }]}
                >
                    <Select placeholder="Select status">
                        <Select.Option key="active" value={true}>Active</Select.Option>
                        <Select.Option key="inactive" value={false}>Inactive</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UsersForm;