import React, { useState } from 'react';
import { Form, Input, Modal, Upload, Button, message } from 'antd';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';

const CategoryForm = ({ open, onCancel, onSubmit, initialValues, mode = 'add' }) => {
    const [form] = Form.useForm();
    const [uploading, setUploading] = useState(false);
    const [fileList, setFileList] = useState([]);

    const handleUpload = (file) => {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('image', file);

            axios.post(
                'https://api.imgbb.com/1/upload?key=88880c6691fc66bb61f3ce04a967586e',
                formData
            )
            .then(response => {
                if (response.data.success) {
                    resolve(response.data.data.url);
                } else {
                    message.error('Failed to upload image');
                    reject(new Error('Upload failed'));
                }
            })
            .catch(error => {
                console.error('Upload error:', error);
                message.error('Failed to upload image');
                reject(error);
            });
        });
    };

    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            console.log('Form values:', values);
            setUploading(true);

            let imageUrls = [];
            if (fileList.length > 0) {
                console.log('Processing images:', fileList);
                
                const uploadPromises = fileList
                    .filter(file => file.originFileObj)
                    .map(file => handleUpload(file.originFileObj));
                
                // Wait for all uploads to complete
                const results = await Promise.all(uploadPromises);
                imageUrls = results.filter(url => url !== null);
                console.log('Uploaded image URLs:', imageUrls);
            }

            const formData = {
                name: values.name,
                slug: generateSlug(values.name),
                images: JSON.stringify(imageUrls.length > 0 ? imageUrls : ['default.jpg'])
            };

            console.log('Submitting form data:', formData);
            await onSubmit(formData);
            form.resetFields();
            setFileList([]);
        } catch (error) {
            console.error('Form validation failed:', error);
            message.error('Failed to submit form: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleChange = ({ fileList: newFileList }) => {
        console.log('File list changed:', newFileList);
        setFileList(newFileList);
    };

    const uploadProps = {
        listType: 'picture',
        maxCount: 5,
        fileList,
        onChange: handleChange,
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('You can only upload image files!');
                return Upload.LIST_IGNORE;
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('Image must be smaller than 2MB!');
                return Upload.LIST_IGNORE;
            }
            return false;
        },
        onRemove: (file) => {
            const newFileList = fileList.filter(item => item.uid !== file.uid);
            setFileList(newFileList);
        }
    };

    return (
        <Modal
            open={open}
            title={mode === 'add' ? 'Add New Category' : 'Edit Category'}
            okText={mode === 'add' ? 'Create' : 'Update'}
            cancelText="Cancel"
            onCancel={() => {
                setFileList([]);
                onCancel();
            }}
            onOk={handleSubmit}
            width={600}
            confirmLoading={uploading}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
            >
                {mode === 'edit' && (
                    <Form.Item
                        name="_id"
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
                    <Input placeholder="Enter category name" />
                </Form.Item>

                <Form.Item
                    label="Category Images"
                >
                    <Upload {...uploadProps}>
                        <Button icon={uploading ? <LoadingOutlined /> : <UploadOutlined />}>
                            {uploading ? 'Uploading...' : 'Upload Images'}
                        </Button>
                    </Upload>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CategoryForm;