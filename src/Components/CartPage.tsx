import React, { useEffect, useState } from 'react';
import { Button, message, Popconfirm } from 'antd';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartItem, deleteCartItem, incrementQuantity, decrementQuantity, removeFromCart } from '../features/authSlice';
import { RootState } from '../store/store';
import cartImage from '../cart.png';
import { DeleteOutlined } from '@ant-design/icons';

type CartItem = {
  id: number;
  name: string;
  price: string;
  quantity: number;
  image: { url: string; thumbUrl: string }[];
};

const CartPage: React.FC = () => {
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.auth.cartItems);
  const [itemToDecrement, setItemToDecrement] = useState<CartItem | null>(null);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleQuantityChange = (product: CartItem, amount: number) => {
    const newQuantity = product.quantity + amount;

    if (newQuantity < 1) {
      setItemToDecrement(product);
    } else {
      if (amount > 0) {
        dispatch(incrementQuantity(product.id));
      } else {
        dispatch(decrementQuantity(product.id));
      }

      dispatch(updateCartItem({ ...product, quantity: newQuantity }))
        .catch(() => {
          if (amount > 0) {
            dispatch(decrementQuantity(product.id));
          } else {
            dispatch(incrementQuantity(product.id));
          }
        });
    }
  };

  const handleRemoveItem = (product: CartItem) => {
    dispatch(removeFromCart(product.id));
    dispatch(deleteCartItem(product.id))
      .then(() => {
        message.success('Product removed from cart');
        setTimeout(() => {
          message.destroy();
        }, 500);
      })
      .catch(() => {
        message.error('Failed to remove product from cart');
        dispatch(incrementQuantity(product.id));
      });
  };

  const handleDecrementConfirmation = () => {
    if (itemToDecrement) {
      dispatch(removeFromCart(itemToDecrement.id));
      dispatch(deleteCartItem(itemToDecrement.id))
        .then(() => {
          message.success('Product removed from cart');
          setTimeout(() => {
            message.destroy();
          }, 500);
        })
        .catch(() => {
          message.error('Failed to remove product from cart');
          dispatch(incrementQuantity(itemToDecrement.id));
        });
      setItemToDecrement(null);
    }
  };

  const calculateSubtotal = () => {
    if (!cart || cart.length === 0) return 0;

    return cart.reduce((sum, item) => {
      const itemPrice = parseFloat(item.price);
      const itemQuantity = item.quantity;
      return sum + (itemPrice * itemQuantity);
    }, 0);
  };

  return (
    <div className="container mx-auto mt-8 px-4 sm:px-6 lg:px-8 max-w-[960px]">
      <div className="flex justify-between items-center mb-8">
        <Link to="/" className="text-blue-600 hover:underline text-base">
          Continue Shopping
        </Link>
        <h2 className="text-3xl font-bold">Cart</h2>
      </div>
      {cart?.length === 0 ? (
        <div className="text-center text-xl font-semibold">
          <img
            src={cartImage}
            alt="Empty Cart"
            className="mx-auto mb-4 w-48 h-48 sm:w-96 sm:h-96"
          />
          Your cart is empty
          <p className="text-gray-500 mt-4">Looks like you have not added anything. Go ahead and explore our top Categories.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="border border-gray-400 rounded-lg p-4 flex flex-col sm:flex-row items-center hover:shadow-lg transition-shadow duration-300 bg-white">
                <img
                  src={item.image[0].url || item.image[0].thumbUrl}
                  alt={item.name}
                  className="h-24 w-24 object-cover rounded-md mb-4 sm:mb-0 sm:mr-4"
                />
                <div className="flex flex-col flex-1">
                  <h3 className="text-lg font-bold truncate break-all">
                  {item.name.length > 10 ? `${item.name.substring(0, 10)}...` : item.name}
                  </h3>
                  <p className="text-gray-500">₹ {item.price}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center mt-4 sm:mt-0 space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center space-x-2">
                    {itemToDecrement && itemToDecrement.id === item.id ? (
                      <Popconfirm
                        title="Quantity is less than 1. Do you want to remove this item?"
                        onConfirm={handleDecrementConfirmation}
                        onCancel={() => setItemToDecrement(null)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          type="text"
                          className="border border-gray-400 px-3 py-1 text-gray-500 hover:text-gray-800 hover:border-gray-500 transition duration-300"
                        >
                          <span className="font-bold">-</span>
                        </Button>
                      </Popconfirm>
                    ) : (
                      <Button
                        type="text"
                        onClick={() => handleQuantityChange(item, -1)}
                        className="border border-gray-400 px-3 py-1 text-gray-500 hover:text-gray-800 hover:border-gray-500 transition duration-300"
                      >
                        <span className="font-bold">-</span>
                      </Button>
                    )}
                    <span>{item.quantity}</span>
                    <Button
                      type="text"
                      onClick={() => handleQuantityChange(item, 1)}
                      className="border border-gray-400 px-3 py-1 text-gray-500 hover:text-gray-800 hover:border-gray-500 transition duration-300"
                    >
                      <span className="font-bold">+</span>
                    </Button>
                  </div>
                  <Popconfirm
                    title="Are you sure you want to remove this item?"
                    onConfirm={() => handleRemoveItem(item)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type="text"
                      className="text-red-500 hover:text-red-700 sm:hidden border border-gray-200"
                      icon={<DeleteOutlined />}
                    />
                    <Button
                      type="text"
                      className="text-red-500 hover:text-red-700 hidden sm:inline-block"
                    >
                      Remove
                    </Button>
                  </Popconfirm>
                </div>
                <div className="text-right mt-4 sm:mt-0">
                  <p className="font-bold">Total: ₹ {parseFloat(item.price) * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-right mt-6">
            <p className="text-xl font-bold">Subtotal: ₹ {calculateSubtotal()}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
