import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct, addCartItem } from '../features/authSlice';
import { RootState } from '../store/store';
import ProductForm from '../Components/ProductForm';
import ProductCard from '../Components/ProductCard';
import Navbar from '../Components/Navbar';

const Home: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const products = useSelector((state: RootState) => state.auth.products);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const showModal = () => {
    setCurrentProduct(null);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleOk = async () => {
    setIsModalVisible(false);
  };

  const handleEdit = (product: any) => {
    setCurrentProduct(product);
    setIsModalVisible(true);
  };

  const handleDelete = (product: any) => {
    dispatch(deleteProduct(product.id));
  };

  const handleAddToCart = (product: any) => {
    dispatch(addCartItem({ ...product, quantity: 1 }));
  };

  return (
    <div>
      <Navbar onAddClick={showModal} />
      <div className="container mx-auto px-4 mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {products.map((product: any) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={() => handleEdit(product)}
            onAddToCart={() => handleAddToCart(product)}
            onDelete={() => handleDelete(product)}
          />
        ))}
      </div>
      <ProductForm
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={handleOk}
        initialValues={currentProduct}
      />
    </div>
  );
};

export default Home;
