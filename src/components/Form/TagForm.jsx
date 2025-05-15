import React, { useEffect } from "react";
import { Form, Input, Modal, ColorPicker, Space } from "antd";

const TagForm = ({ open, onCancel, onSubmit, initialValues, mode = "add" }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        bgColor: initialValues.bgColor,
        textColor: initialValues.textColor,
      });
    } else {
      form.resetFields();
    }
  }, [form, initialValues]);

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = {
        name: values.name,
        bgColor: values.bgColor.toHexString ? values.bgColor.toHexString() : values.bgColor,
        textColor: values.textColor.toHexString ? values.textColor.toHexString() : values.textColor,
      };

      // Only generate slug for new tags
      if (mode === 'add') {
        formData.slug = generateSlug(values.name);
      }

      await onSubmit(formData);
      if (mode === 'add') {
        form.resetFields();
      }
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  return (
    <Modal
      open={open}
      title={mode === "add" ? "Add New Tag" : "Edit Tag"}
      okText={mode === "add" ? "Create" : "Update"}
      cancelText="Cancel"
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleSubmit}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          bgColor: "#ffffff",
          textColor: "#000000",
        }}
      >
        {mode === "edit" && (
          <>
            <Form.Item name="_id" label="ID">
              <Input disabled />
            </Form.Item>
            <Form.Item name="slug" label="Slug">
              <Input disabled />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="name"
          label="Tag Name"
          rules={[{ required: true, message: "Please input tag name!" }]}
        >
          <Input placeholder="Enter tag name" />
        </Form.Item>

        <Form.Item label="Colors">
          <Space>
            <Form.Item name="bgColor" label="Background Color" noStyle>
              <ColorPicker />
            </Form.Item>

            <Form.Item name="textColor" label="Text Color" noStyle>
              <ColorPicker />
            </Form.Item>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TagForm;
