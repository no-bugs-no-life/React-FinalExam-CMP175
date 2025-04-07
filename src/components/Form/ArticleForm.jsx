import React, { useState, useEffect } from 'react';
import { Form, Input, Modal, Select, message } from 'antd';
import PropTypes from 'prop-types';
import useCategoryStore from '../../store/categoryStore';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import Editor from 'ckeditor5-custom-build-v5-full';
import { CKEConfig } from '../../utils/CkeditorConfig';
import './ArticleForm.css';

const { Option } = Select;

const ArticleForm = ({ open, onCancel, onSubmit, initialValues, mode = 'add' }) => {
    const [form] = Form.useForm();
    const [editorContent, setEditorContent] = useState('');
    const [editorInitialized, setEditorInitialized] = useState(false);
    const categories = useCategoryStore((state) => state.categories);
    const fetchCategories = useCategoryStore((state) => state.fetchCategories);
    const categoriesLoading = useCategoryStore((state) => state.loading);

    // Xử lý việc load initialValues vào form và editor
    useEffect(() => {
        if (open) {
            fetchCategories();
            
            if (initialValues) {
                console.log('Loading initial values:', initialValues);
                
                // Format categoryIds từ initialValues
                const formattedValues = {
                    ...initialValues,
                    categoryIds: initialValues.articleCategories?.map(ac => ac.categoryId) || []
                };
                
                // Set form values
                form.setFieldsValue(formattedValues);
                
                // Set editor content
                setEditorContent(initialValues.content || '');
            } else {
                // Reset form và editor khi thêm mới
                form.resetFields();
                setEditorContent('');
            }
        }
    }, [open, initialValues, form, fetchCategories]);

    const handleEditorChange = (event, editor) => {
        const data = editor.getData();
        setEditorContent(data);
        // Cập nhật giá trị vào form để validation
        form.setFieldsValue({ content: data });
    };

    const handleEditorReady = (editor) => {
        console.log('CKEditor is ready to use!', editor);
        setEditorInitialized(true);
        
        // Nếu có initialValues, cập nhật nội dung
        if (initialValues?.content) {
            editor.setData(initialValues.content);
        }
        
        // Quan trọng: Đặt focus vào editor để người dùng có thể gõ ngay
        editor.editing.view.focus();
    };

    const handleSubmit = () => {
        form.validateFields()
            .then((values) => {
                // Đảm bảo content từ CKEditor được đưa vào values
                const updatedValues = {
                    ...values,
                    content: editorContent
                };
                onSubmit(updatedValues);
            })
            .catch((info) => {
                console.error('Validation Failed:', info);
                message.error('Please correct the errors in the form.');
            });
    };

    const handleCancel = () => {
        form.resetFields();
        setEditorContent('');
        onCancel();
    };

    return (
        <Modal
            open={open}
            title={mode === 'add' ? 'Add New Article' : 'Edit Article'}
            okText={mode === 'add' ? 'Create' : 'Update'}
            cancelText="Cancel"
            onCancel={handleCancel}
            onOk={handleSubmit}
            width={900}
            bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
            destroyOnClose={true} // Đảm bảo component được khởi tạo lại mỗi lần mở
        >
            <Form
                form={form}
                layout="vertical"
                preserve={false}
            >
                {mode === 'edit' && (
                    <Form.Item name="id" label="ID">
                        <Input disabled />
                    </Form.Item>
                )}

                <Form.Item
                    name="title"
                    label="Title"
                    rules={[{ required: true, message: 'Please input article title!' }]}
                >
                    <Input placeholder="Enter article title" />
                </Form.Item>

                <Form.Item
                    name="content"
                    label="Content"
                    rules={[
                        { 
                            required: true, 
                            message: 'Please input article content!' 
                        },
                        { 
                            validator: (_, value) => {
                                if (!value || value.trim() === '' || value.trim() === '<p>&nbsp;</p>') {
                                    return Promise.reject('Article content cannot be empty');
                                }
                                return Promise.resolve();
                            } 
                        }
                    ]}
                >
                    <div className="ckeditor-container">
                        {open && (
                            <CKEditor
                                editor={Editor}
                                config={{
                                    ...CKEConfig,
                                    placeholder: 'Type your content here...'
                                }}
                                data={editorContent}
                                onChange={handleEditorChange}
                                onReady={handleEditorReady}
                            />
                        )}
                    </div>
                </Form.Item>

                <Form.Item
                    name="image"
                    label="Image URL"
                    rules={[{ required: true, message: 'Please provide an image URL!' }]}
                >
                    <Input placeholder="Enter image URL" />
                </Form.Item>

                <Form.Item
                    name="categoryIds"
                    label="Categories"
                    rules={[{ required: true, message: 'Please select at least one category!' }]}
                >
                    <Select
                        mode="multiple"
                        placeholder="Select categories"
                        style={{ width: '100%' }}
                        loading={categoriesLoading}
                    >
                        {categories.map(category => (
                            <Option key={category.id} value={category.id}>{category.name}</Option>
                        ))}
                    </Select>
                </Form.Item>

                {mode === 'edit' && (
                    <Form.Item name="authorId" label="Author ID">
                        <Input disabled />
                    </Form.Item>
                )}

                {mode === 'edit' && (
                    <Form.Item
                        name="status"
                        label="Status"
                    >
                        <Select disabled>
                            <Option value={0}>Pending</Option>
                            <Option value={1}>Approved</Option>
                            <Option value={2}>Rejected</Option>
                        </Select>
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
};

ArticleForm.propTypes = {
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    initialValues: PropTypes.object,
    mode: PropTypes.oneOf(['add', 'edit'])
};

export default ArticleForm;