import React from 'react';
import { Form, Input, Modal } from 'antd';

const CategoryForm = ({ open, onCancel, onSubmit, initialValues, mode = 'add' }) => {
    const [form] = Form.useForm();

    const handleSubmit = () => {
        form.validateFields()
            .then((values) => {
                onSubmit(values);
                form.resetFields();
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    };

    return (
        <Modal
            open={open}
            title={mode === 'add' ? 'Add New Category' : 'Edit Category'}
            okText={mode === 'add' ? 'Create' : 'Update'}
            cancelText="Cancel"
            onCancel={onCancel}
            onOk={handleSubmit}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
            >
                {mode === 'edit' && (
                    <Form.Item
                        name="id"
                        label="ID"
                    >
                        <Input disabled />
                    </Form.Item>
                )}

                <Form.Item
                    name="name"
                    label="Category Name"
                    rules={[{ required: true, message: 'Please input category name!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                >
                    <Input.TextArea rows={4} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CategoryForm;