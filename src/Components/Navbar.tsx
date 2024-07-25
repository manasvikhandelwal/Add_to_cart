import  { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { Button, Badge } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCart } from '../features/authSlice';
import { RootState } from '../store/store';

type NavbarProps = {
  onAddClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onAddClick }) => {
  const [totalUniqueProducts, setTotalUniqueProducts] = useState(0);
  const cart = useSelector((state: RootState) => state.auth.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    const totalUniqueProducts1 = new Set(cart.map(item => item.id)).size;
    setTotalUniqueProducts(totalUniqueProducts1);
  }, [cart]);

  return (
    <nav className="bg-slate-700 md:w-full shadow-lg p-4 pr-6 sm:p-6 md:p-7">
      <div className="mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <span className="text-xl sm:text-2xl font-semibold  text-white">ShopEase</span>
        </div>
        <div className="flex items-center space-x-4 sm:space-x-6">
        <Button
  className="bg-yellow-400 text-black px-2 py-1 sm:px-4 font-semibold sm:py-2 rounded-lg hover:bg-yellow-500 transition duration-300 ease-in-out flex items-center"
  onClick={onAddClick}
>
  <PlusOutlined className="mr-2" />
  Add Product
</Button>
          <Badge count={totalUniqueProducts} showZero>
            <FontAwesomeIcon
              icon={faCartShopping}
              size="lg"
              className="text-white hover:text-gray-900 transition duration-300 ease-in-out cursor-pointer"
              onClick={() => navigate('/cart')}
            />
          </Badge>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
