import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Catalog } from './pages/Catalog';
import { Admin } from './pages/Admin';
import { AdminOrders } from './pages/AdminOrders';
import { AdminProducts } from './pages/AdminProducts';
import { AdminSettings } from './pages/AdminSettings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/mayluce" element={<Admin />}>
          <Route index element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
