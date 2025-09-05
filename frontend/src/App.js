import { useState, useEffect, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Spinner } from 'react-bootstrap';
import { BrowserRouter } from 'react-router-dom';
import { Context } from './index';
import { check } from './http/userApi';
import { jwtDecode } from 'jwt-decode';
import Header from './components/Header';
import Footer from './components/Footer';
import AppRouter from './components/AppRouter';

const App = observer(() => {
  const { user, items } = useContext(Context);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const userData = await check();
        if (userData) {
          if (userData.id) {
            user.setIsAuth(true);
            user.setUser(userData);
          } else {
            user.setIsAuth(false);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        user.setIsAuth(false);
        user.setUser({});
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const deleteOrder = (id) => {
    items.setOrders(items.isOrders.filter(el => el.id !== id));
  };

  if (loading) {
    return <Spinner animation="grow" />;
  }

  return (
    <div className="wrapper">
      <Header orders={items.isOrders} onDelete={deleteOrder} />
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
      <Footer />
    </div>
  );
});

export default App;