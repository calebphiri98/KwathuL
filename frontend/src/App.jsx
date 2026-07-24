import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import { RequireAuth, RequireAdmin } from './components/RouteGuards.jsx';

import Home from './pages/Home.jsx';
import Menu from './pages/Menu.jsx';
import Cart from './pages/Cart.jsx';
import Orders from './pages/Orders.jsx';
import Recipes from './pages/Recipes.jsx';
import RecipeDetail from './pages/RecipeDetail.jsx';
import Blog from './pages/Blog.jsx';
import BlogDetail from './pages/BlogDetail.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

import AdminLayout from './pages/admin/AdminLayout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import ManageProducts from './pages/admin/ManageProducts.jsx';
import ManageRecipes from './pages/admin/ManageRecipes.jsx';
import ManageBlog from './pages/admin/ManageBlog.jsx';
import ManageOrders from './pages/admin/ManageOrders.jsx';
import Messages from './pages/admin/Messages.jsx';

export default function App() {
  return (
    <CartProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipes/:slug" element={<RecipeDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />

        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="recipes" element={<ManageRecipes />} />
          <Route path="blog" element={<ManageBlog />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="messages" element={<Messages />} />
        </Route>

        <Route path="*" element={<p style={{ textAlign: 'center', padding: 60 }}>Page not found.</p>} />
      </Routes>
      <Footer />
    </CartProvider>
  );
}
