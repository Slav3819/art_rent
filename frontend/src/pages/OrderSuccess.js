import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrderSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="order-success">
      <h2>Заказ успешно оформлен!</h2>
      <p>Спасибо за ваш заказ. Мы свяжемся с вами в ближайшее время для подтверждения.</p>
      <button 
        className="back-to-shop"
        onClick={() => navigate('/shop')}
      >
        Вернуться в магазин
      </button>
    </div>
  );
};

export default OrderSuccess;