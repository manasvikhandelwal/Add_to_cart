import  { useEffect, useState } from 'react';
import { Modal, Form, Input, Upload, Button, Select, message, DatePicker, Checkbox, Radio } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { addProduct, editProduct } from '../features/authSlice';
import moment from 'moment';

const { TextArea } = Input;
const CheckboxGroup = Checkbox.Group;

const plainOptions = ['Levis', 'H&M', 'Roadster'];
const defaultCheckedList = ['Levis', 'Roadster'];

type ProductFormProps = {
  open: boolean;
  onCancel: () => void;
  onOk: (values: any) => void;
  initialValues: any;
}

const ProductForm: React.FC<ProductFormProps> = ({ open, onCancel, onOk, initialValues }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [checkedList, setCheckedList] = useState<string[]>(defaultCheckedList);
  const [paymentMethod, setPaymentMethod] = useState<string>('cod');

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          image: initialValues.image ? [
            {
              uid: initialValues.image.uid,
              name: initialValues.image.name,
              status: initialValues.image.status,
              url: initialValues.image[0].url || initialValues.image[0].thumbUrl,
            },
          ] : [],
          date_of_order: initialValues.date_of_order ? moment(initialValues.date_of_order) : null,
          selectedOptions: initialValues.selectedOptions || defaultCheckedList,
          paymentMethod: initialValues.paymentMethod || 'cod',
        });
        setCheckedList(initialValues.selectedOptions || defaultCheckedList);
        setPaymentMethod(initialValues.paymentMethod || 'cod');
      } else {
        form.resetFields();
        setCheckedList(defaultCheckedList);
        setPaymentMethod('cod');
      }
    }
  }, [form, initialValues, open]);

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return Upload.LIST_IGNORE;
    }
    form.setFieldsValue({ image: [file] });
    return false;
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      values.selectedOptions = checkedList;
      values.paymentMethod = paymentMethod;
      if (initialValues) {
        values.id = initialValues.id;
        await dispatch(editProduct({ ...values }));
      } else {
        await dispatch(addProduct(values));
      }
      form.resetFields();
      onOk(values);
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setCheckedList(defaultCheckedList);
    setPaymentMethod('cod');
    onCancel();
  };

  const onChange = (list: string[]) => {
    setCheckedList(list);
    form.setFieldsValue({ selectedOptions: list });
  };

  const onPaymentMethodChange = (e: any) => {
    setPaymentMethod(e.target.value);
  };

  const disabledDate = (current: any) => {
    return current && current > moment().endOf('day');
  };

  // const handlePriceInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   const key = e.key;
  
  //   if (
  //     (key >= '0' && key <= '9') || 
  //     key === 'Backspace' || 
  //     key === 'Delete' 
  //   ) {
  //     return true;
  //   }
  
  //   e.preventDefault();
  // };
  const handlePriceInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;
    if ((key >= '0' && key <= '9') || key === 'Backspace' || key === 'Delete') {
      
      const currentValue = (e.target as HTMLInputElement).value + key;
      if (parseInt(currentValue, 10) > 1000000) {
        e.preventDefault();
      }
    } else {
      e.preventDefault();
    }
  };

  return (
    <Modal
      open={open}
      title={initialValues ? 'Edit Product' : 'Add New Product'}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          {initialValues ? 'Update' : 'Add'}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Product Name"
          rules={[{ required: true, message: 'Please enter the product name' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="image"
          label="Product Image"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[{ required: true, message: 'Please upload an image' }]}
        >
          <Upload
            name="image"
            listType="picture"
            beforeUpload={beforeUpload}
            accept=".jpg,.jpeg,.png,.gif"
            fileList={form.getFieldValue('image')}
          >
            <Button icon={<UploadOutlined />}>Upload Image</Button>
          </Upload>
        </Form.Item>
        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: 'Please select the category' }]}
        >
          <Select placeholder="Select category">
            <Select.Option value="clothes">Clothes</Select.Option>
            <Select.Option value="grocery">Grocery</Select.Option>
            <Select.Option value="gadgets">Gadgets</Select.Option>
            <Select.Option value="beauty products">Beauty Products</Select.Option>
            <Select.Option value="home decor">Home Decor</Select.Option>
            <Select.Option value="others">Others</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter the description' }]}
        >
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item
          name="price"
          label="Price"
          rules={[{ required: true, message: 'Please enter the price' }]}
        >
          <Input onKeyDown={handlePriceInput} />
        </Form.Item>
        <Form.Item
          name="date_of_order"
          label="Date of Order"
          rules={[{ required: true, message: 'Please select the date of order' }]}
        >
          <DatePicker format="YYYY-MM-DD" disabledDate={disabledDate} />
        </Form.Item>
        <Form.Item
          name="selectedOptions"
          label="Brands"
          rules={[{ required: true, message: 'Please select at least one brand' }]}
        >
          <CheckboxGroup options={plainOptions} value={checkedList} onChange={onChange} className="flex flex-col sm:flex-row sm:flex-wrap" />
        </Form.Item>
        <Form.Item
          name="paymentMethod"
          label="Payment Method"
          rules={[{ required: true, message: 'Please select a payment method' }]}
        >
          <Radio.Group onChange={onPaymentMethodChange} value={paymentMethod} className="flex flex-col sm:flex-row sm:flex-wrap">
            <Radio value="cod">Cash on Delivery</Radio>
            <Radio value="online">Online Payment (Bank)</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductForm;
