import React, { useEffect, useState, useContext } from 'react';
import { Context } from '../index';
import { useNavigate } from 'react-router-dom';
import { RxMargin } from 'react-icons/rx';

const Basket = () => {
  const { items } = useContext(Context);
  const { user } = useContext(Context);

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      items.setOrders(JSON.parse(savedCart));
    }
    setLoading(false);
  }, []);

  const removeFromCart = (id) => {
    const updatedOrders = items.isOrders.filter(item => item.id !== id);
    items.setOrders(updatedOrders);
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedOrders = items.isOrders.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    items.setOrders(updatedOrders);
  };

  const calculateTotal = () => {
    return items.isOrders.reduce((total, item) => {
      return total + (item.price * (item.quantity || 1));
    }, 0);
  };

  if (loading) {
    return <div>Загрузка корзины...</div>;
  }

  return (
    <div className="basket-container">
      <h2>Ваша корзина</h2>
      
      {items.isOrders.length === 0 ? (
        <div className="empty-cart">
          <p>Ваша корзина пуста</p>
          <button 
            className="continue-shopping"
            onClick={() => navigate('/shop')}
          >
            Вернуться в магазин
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.isOrders.map(item => (
              <div key={item.id} className="cart-item">
                <img 
                  src={"./img/" + item.img} 
                  alt={item.title} 
                  className="item-image"
                />
                <div className="item-details">
                  <h3>{item.title}</h3>
                  <p>Цена: {item.price}  BYN/сутки</p>
                  <div className="quantity-controls">
                  <p>Количество суток</p>
                    <button 
                      onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                      disabled={(item.quantity || 1) <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity || 1}</span>
                    <button onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}>
                      +
                    </button>
                  </div>
                </div>
                <div className="item-total">
                  Итого: {(item.price * (item.quantity || 1)).toFixed(2)} BYN
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="total-summary">
              <span>Общая сумма:</span>
              <span>{calculateTotal().toFixed(2)} BYN</span>
            </div>
            {user.isAuth ?
              <button 
                className="checkout-btn"
                onClick={() => navigate('/checkout')}
              >
                Оформить заказ
              </button>
            :  
              <button 
                className="checkout-btn"
                onClick={() => navigate('/login')}
              >
                Войти
              </button>
            }
          </div>
        </>
      )}
    </div>
  );
};

export default Basket;