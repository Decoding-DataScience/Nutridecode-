import { Outlet } from 'react-router-dom';
import { Breadcrumb } from './Breadcrumb';
import Header from './Header';
import Footer from './Footer';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Breadcrumb />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}; 