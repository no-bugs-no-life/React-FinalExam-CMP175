import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Modal,
  Select,
  DatePicker,
  Upload,
  Button,
  Space,
  message,
} from "antd";
import { UploadOutlined, LoadingOutlined, DeleteOutlined } from "@ant-design/icons";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import dayjs from "dayjs";
import axios from "axios";
import useCategoryStore from "../../store/categoryStore";
import useTagStore from "../../store/tagStore";
import "./ArticleForm.css";

const { TextArea } = Input;

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "indent",
  "align",
  "link",
  "image",
];

const ArticleForm = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  mode = "add",
}) => {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const { categories, fetchCategories } = useCategoryStore();
  const { tags, fetchTags } = useTagStore();

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, [fetchCategories, fetchTags]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        publishedAt: initialValues.publishedAt
          ? dayjs(initialValues.publishedAt)
          : undefined,
        tags: initialValues.tags?.map((tag) => tag._id),
        category: initialValues.category?._id,
        source: initialValues.source?.name,
        sourceUrl: initialValues.source?.url,
      });
      setImageUrl(initialValues.thumbnail);
    } else {
      form.resetFields();
      setImageUrl("");
    }
  }, [form, initialValues]);

  const handleUpload = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(
        "https://api.imgbb.com/1/upload?key=88880c6691fc66bb61f3ce04a967586e",
        formData
      );

      if (response.data.success) {
        setImageUrl(response.data.data.url);
        return response.data.data.url;
      }
      return "";
    } catch (error) {
      console.error("Error uploading image:", error);
      return "";
    } finally {
      setUploading(false);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = {
        ...values,
        slug: generateSlug(values.title),
        thumbnail: imageUrl,
        source: values.source ? {
          name: values.source,
          url: values.sourceUrl || ''
        } : undefined,
        publishedAt: values.publishedAt?.toISOString(),
        isCrawled: false,
        status: 'draft'
      };

      // Remove source-related form fields that were just for the form
      delete formData.sourceUrl;

      await onSubmit(formData);
      onCancel(); // Close the modal after successful submission
      if (mode === 'add') {
        form.resetFields();
        setImageUrl('');
      }
    } catch (error) {
      console.error('Form validation failed:', error);
      if (error.errorFields) {
        message.error('Please check all required fields');
      }
    }
  };

  const uploadProps = {
    beforeUpload: async (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return Upload.LIST_IGNORE;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("Image must be smaller than 2MB!");
        return Upload.LIST_IGNORE;
      }
      await handleUpload(file);
      return false;
    },
    showUploadList: false,
  };

  return (
    <Modal
      open={open}
      title={mode === "add" ? "Add New Article" : "Edit Article"}
      okText={mode === "add" ? "Create" : "Update"}
      cancelText="Cancel"
      onCancel={() => {
        form.resetFields();
        setImageUrl("");
        onCancel();
      }}
      onOk={handleSubmit}
      width={1000}
      style={{ top: 20 }}
    >
      <Form form={form} layout="vertical">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: "Please input article title!" }]}
            >
              <Input placeholder="Enter article title" />
            </Form.Item>

            <Form.Item
              name="summary"
              label="Summary"
              rules={[{ required: true, message: "Please input article summary!" }]}
            >
              <TextArea
                placeholder="Enter article summary"
                autoSize={{ minRows: 3, maxRows: 5 }}
              />
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: "Please select a category!" }]}
            >
              <Select placeholder="Select category">
                {categories.map((category) => (
                  <Select.Option key={category._id} value={category._id}>
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="tags"
              label="Tags"
              rules={[{ required: true, message: "Please select at least one tag!" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select tags"
                style={{ width: "100%" }}
              >
                {tags.map((tag) => (
                  <Select.Option key={tag._id} value={tag._id}>
                    {tag.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="publishedAt"
              label="Publish Date"
              rules={[{ required: true, message: "Please select publish date!" }]}
            >
              <DatePicker showTime style={{ width: "100%" }} />
            </Form.Item>
          </div>

          <div>
            <Form.Item name="source" label="Source Name">
              <Input placeholder="Enter source name" />
            </Form.Item>

            <Form.Item name="sourceUrl" label="Source URL">
              <Input placeholder="Enter source URL" />
            </Form.Item>

            <Form.Item label="Thumbnail">
              <Upload {...uploadProps}>
                <Button icon={uploading ? <LoadingOutlined /> : <UploadOutlined />}>
                  {uploading ? "Uploading..." : "Upload Thumbnail"}
                </Button>
              </Upload>
              {imageUrl && (
                <div style={{ marginTop: 8, position: 'relative' }}>
                  <img
                    src={imageUrl}
                    alt="thumbnail"
                    style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "4px" }}
                  />
                  <Button 
                    type="text" 
                    danger
                    icon={<DeleteOutlined />}
                    style={{ position: 'absolute', top: 8, right: 8 }}
                    onClick={() => setImageUrl("")}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </Form.Item>
          </div>
        </div>

        <Form.Item
          name="content"
          label="Content"
          rules={[{ required: true, message: "Please input article content!" }]}
          style={{ marginTop: '20px' }}
        >
          <ReactQuill 
            theme="snow" 
            modules={modules}
            formats={formats}
            style={{ height: 300, marginBottom: 50 }} 
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ArticleForm;
