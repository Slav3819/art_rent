import React, { useEffect, useState, useContext } from 'react';
import { Context } from '../index';
import { useNavigate } from 'react-router-dom';
import { orderSuccess } from '../http/deviceApi';


const Checkout = () => {
  const { items } = useContext(Context);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    paymentMethod: 'cash',
    comments: ''
  });

  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      items.setOrders(JSON.parse(savedCart));
    }
    setLoading(false);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    return items.isOrders.reduce((total, item) => {
      return total + (item.price * (item.quantity || 1));
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // добавить логику дабавления заказа в базу
    try {
          let data;
          data = orderSuccess(formData, items.isOrders, calculateTotal());

        } catch (e){
          alert(e.response.data.message)
        }

    console.log('Order submitted:', {
      customerInfo: formData,
      orderItems: items.isOrders,
      total: calculateTotal()
    });
    



    items.setOrders([]);
    localStorage.removeItem('cartItems');
    navigate('/order-success');
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (items.isOrders.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Оформление заказа</h2>
        <p>Ваша корзина пуста</p>
        <button 
          className="continue-shopping"
          onClick={() => navigate('/shop')}
        >
          Вернуться в магазин
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h2>Оформление заказа</h2>
      
      <div className="checkout-content">
        <div className="order-summary">
          <h3>Ваш заказ</h3>
          <div className="order-items">
            {items.isOrders.map(item => (
              <div key={item.id} className="order-item">
                <div className="item-name">
                  {item.title} × {item.quantity || 1} суток
                </div>
                <div className="item-price">
                  {(item.price * (item.quantity || 1)).toFixed(2)} BYN
                </div>
              </div>
            ))}
          </div>
          <div className="order-total">
            <span>Итого:</span>
            <span>{calculateTotal().toFixed(2)} BYN</span>
          </div>
        </div>

        <form className="checkout-form" onSubmit={handleSubmit}>
          <h3>Контактная информация</h3>
          
          <div className="form-group">
            <label htmlFor="name">ФИО*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Телефон*</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Адрес доставки*</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Способ оплаты</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={handleInputChange}
                />
                Наличными при получении
              </label>
              <label>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={handleInputChange}
                />
                Картой
              </label>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="comments">Комментарий к заказу</label>
            <textarea
              id="comments"
              name="comments"
              value={formData.comments}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          
          <button type="submit" className="submit-order">
            Подтвердить заказ
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;