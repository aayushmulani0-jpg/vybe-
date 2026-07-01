import { Routes, Route } from 'react-router-dom';
import ThemeProvider from './components/ThemeProvider';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Wholesale from './pages/Wholesale';
import DesignUpload from './pages/DesignUpload';
import CustomOrder from './pages/CustomOrder';
import About from './pages/About';
import Catalogue from './pages/Catalogue';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Profile from './pages/Profile';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="wholesale" element={<Wholesale />} />
          <Route path="wholesale/upload" element={<DesignUpload />} />
          <Route path="custom" element={<CustomOrder />} />
          <Route path="custom-print" element={<CustomOrder />} />
          <Route path="catalogue" element={<Catalogue />} />
          <Route path="about" element={<About />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
