import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Wholesale from './pages/Wholesale';
import DesignUpload from './pages/DesignUpload';
import CustomOrder from './pages/CustomOrder';
import About from './pages/About';
import Contact from './pages/Contact';
import Catalogue from './pages/Catalogue';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="shop/:id" element={<ProductDetails />} />
        <Route path="wholesale" element={<Wholesale />} />
        <Route path="wholesale/upload" element={<DesignUpload />} />
        <Route path="custom" element={<CustomOrder />} />
        <Route path="catalogue" element={<Catalogue />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
      </Route>
    </Routes>
  );
}

export default App;
