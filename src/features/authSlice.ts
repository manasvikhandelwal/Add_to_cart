import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store/store';

export type CartItem = {
  id: number;
  name: string;
  price: string;
  quantity: number;
  image: { url: string; thumbUrl: string }[];
}

export type Product = {
  id: number;
  name: string;
  image: string;
  category: string;
  price: number;
  description: string;
}

type AuthState = {
  cartItems: CartItem[];
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  cartItems: [],
  products: [],
  loading: false,
  error: null,
};

export const fetchCart:any = createAsyncThunk('auth/fetchCart', async () => {
  const response = await axios.get('http://localhost:3001/cart');
  return response.data;
});

export const updateCartItem:any = createAsyncThunk('auth/updateCartItem', async (item: CartItem) => {
  const response = await axios.put(`http://localhost:3001/cart/${item.id}`, item);
  return response.data;
});

export const deleteCartItem:any = createAsyncThunk('auth/deleteCartItem', async (id: number) => {
  await axios.delete(`http://localhost:3001/cart/${id}`);
  return id;
});

export const addCartItem:any = createAsyncThunk('cart/addCartItem', async (item: CartItem, { getState }) => {
    const state = (getState() as RootState);
    console.log(state);
   let existingItem:any = await axios.get(`http://localhost:3001/cart`);
   existingItem=existingItem.data.filter((cartItem:any)=>{return cartItem.id === item.id})
   if(existingItem.length > 0){
    const updatedItem={...existingItem[0],quantity:existingItem[0].quantity + 1};
    const response= await axios.put(`http://localhost:3001/cart/${item.id}`, updatedItem);
    return response.data;
   }else{
    const data=JSON.parse(JSON.stringify({...item,quantity:1}))
    const response= await axios.post(`http://localhost:3001/cart`, data);
    return response.data;
   }
  });

export const fetchProducts:any = createAsyncThunk('auth/fetchProducts', async () => {
  const response = await axios.get<Product[]>('http://localhost:3001/items');
  return response.data;
});

export const addProduct:any = createAsyncThunk('auth/addProduct', async (newProduct: Omit<Product, 'id'>) => {
  const response = await axios.post<Product>('http://localhost:3001/items', newProduct);
  return response.data;
});

export const editProduct:any = createAsyncThunk('auth/editProduct', async (updatedProduct: Product) => {
  const { id, ...rest } = updatedProduct;
  const response = await axios.put<Product>(`http://localhost:3001/items/${id}`, rest);

  const response2 = await axios.get(`http://localhost:3001/cart`);
  if (Array.isArray(response2.data)) {
    let cartItem = response2.data.filter((item: any) => item.id === id)
    if (cartItem.length > 0) {
      let cartData = { ...cartItem[0], ...rest }
      const response3 = await axios.put(`http://localhost:3001/cart/${cartData.id}`, cartData);
      console.log(response3)
    }
  }
  return response.data;
});

export const deleteProduct:any = createAsyncThunk('auth/deleteProduct', async (id: number) => {
  await axios.delete(`http://localhost:3001/items/${id}`);
  return id;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.cartItems = action.payload;
    },
    incrementQuantity(state, action: PayloadAction<number>) {
      const item = state.cartItems.find(item => item.id === action.payload);
      if (item) {
        item.quantity++;
      }
    },
    decrementQuantity(state, action: PayloadAction<number>) {
      const item = state.cartItems.find(item => item.id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity--;
      }
    },
    removeFromCart(state, action: PayloadAction<number>) {
      state.cartItems = state.cartItems.filter(item => item.id !== action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.cartItems = action.payload;
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        const existingItem = state.cartItems.find(item => item.id === action.payload.id);
        if (existingItem) {
          existingItem.quantity = action.payload.quantity;
        } else {
          state.cartItems.push(action.payload);
        }
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const index = state.cartItems.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.cartItems[index] = action.payload;
        }
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.cartItems = state.cartItems.filter(item => item.id !== action.payload);
      })
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(item => item.id !== action.payload);
      });
  },
});

export const { setCart, incrementQuantity, decrementQuantity, removeFromCart } = authSlice.actions;

export const selectCartItems = (state: RootState) => state.auth.cartItems;
export const selectProducts = (state: RootState) => state.auth.products;

export default authSlice.reducer;
