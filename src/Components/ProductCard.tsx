import { useState } from 'react';
import { Card, Button, Modal, message } from 'antd';
import { ShoppingCartOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { addCartItem, deleteCartItem } from '../features/authSlice';
import moment from 'moment';

type ProductCardProps = {
  product: {
    id: number;
    name: string;
    image: { url: string; thumbUrl: string }[];
    category: string;
    price: number;
    description: string;
    date_of_order: string;
    selectedOptions: string[];
    paymentMethod: string;
  };
  onEdit: (product: any) => void;
  onDelete: () => void;
  onAddToCart: () => void;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  const dispatch = useDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleAddToCart = () => {
    const newItem = { ...product, quantity: 1 };
    dispatch(addCartItem(newItem));
    message.success("Product is added");
    setTimeout(() => {
      message.destroy();
    }, 200);
  };

  const handleEdit = () => {
    Modal.confirm({
      title: 'Are you sure you want to edit this product?',
      onOk: () => {
        onEdit(product);
      },
      onCancel() {},
      centered: true,
    });
  };

  const handleDeleteProduct = () => {
    Modal.confirm({
      title: 'Are you sure you want to delete this product?',
      onOk: () => {
        dispatch(deleteCartItem(product.id));
        onDelete();
      },
      onCancel() {},
      centered: true,
    });
  };

  return (
    <>
      <div className="hm-product-item border border-gray-200 shadow-md rounded-lg overflow-hidden cursor-pointer transition duration-300 ease-in-out transform hover:shadow-lg mb-6">  {/* Added mb-6 for margin bottom */}
        <Card
          hoverable
          className="border-transparent shadow-md rounded-lg relative group transition duration-300 ease-in-out transform hover:shadow-lg hover:border-purple-300"
          cover={
            <div className="p-2 cursor-pointer" onClick={showModal}>
              <img
                alt={product.name}
                src={product.image[0]?.url || product.image[0]?.thumbUrl || 'fallback-image-url'}
                className="h-auto w-full object-cover rounded-t-lg item-link remove-loading-spinner"
              />
            </div>
          }
        >
          <Card.Meta
            title={
              <div className="p-4">
                <p className="text-lg font-semibold text-gray-800">
                  {product.name.length > 10 ? `${product.name.substring(0, 10)}...` : product.name}
                </p>
                <p className="text-lg text-gray-600 mt-1">₹{product.price}</p>
              </div>
            }
          />
          <div className="flex flex-row sm:flex-row justify-start mt-4 gap-2">
            <Button
              onClick={handleAddToCart}
              className="w-full sm:w-auto flex items-center justify-center p-3 rounded-lg"
            >
              <ShoppingCartOutlined className="text-blue-500 text-lg sm:text-xl" />
            </Button>
            <Button
              onClick={handleEdit}
              className="w-full sm:w-auto flex items-center justify-center p-3 rounded-lg"
            >
              <EditOutlined className="text-gray-500 text-lg sm:text-xl" />
            </Button>
            <Button
              onClick={handleDeleteProduct}
              className="w-full sm:w-auto flex items-center justify-center p-3 rounded-lg"
            >
              <DeleteOutlined className="text-red-500 text-lg sm:text-xl" />
            </Button>
          </div>
        </Card>
      </div>
      <Modal
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="close" onClick={handleCancel}>
            Close
          </Button>,
        ]}
        width={800}
        centered
      >
        <div className="flex items-center justify-center p-5">
          <div className="w-full lg:flex">
            <div className="lg:w-1/2 h-full p-5">
              <img
                alt={product.name}
                src={product.image[0]?.url || product.image[0]?.thumbUrl || 'fallback-image-url'}
                className="h-auto w-full object-contain rounded-lg"
              />
            </div>
            <div className="lg:w-1/2 p-5 pt-4">
              <p className="font-bold text-2xl mb-2 overflow-hidden overflow-ellipsis">{product.name}</p>
              <p className="text-gray-700 mb-2">Category: {product.category}</p>
              <p className="text-gray-700 mb-2">Price: ₹{product.price}</p>
              <p className="text-gray-700 mb-2">Description: {product.description}</p>
              <p className="text-gray-700 mb-2">Date of Order: {moment(product.date_of_order).format('YYYY-MM-DD')}</p>
              <p className="text-gray-700 mb-2">Selected Brands: {product.selectedOptions.join(', ')}</p>
              <p className="text-gray-700 mb-2">Payment Method: {product.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Bank)'}</p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProductCard;
