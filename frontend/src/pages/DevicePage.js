import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../index';
import { device } from '../http/deviceApi';
import styles from './DevicePage.module.css';

const DevicePage = observer(() => {
  const { items } = useContext(Context);
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentDevice, setCurrentDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const response = await device();
        items.setItems(response.data.results);
        const foundDevice = response.data.results.find(el => el.id.toString() === id);
        if (foundDevice) {
          setCurrentDevice(foundDevice);
        } else {
          setError(`Устройство с ID ${id} не найдено`);
        }
      } catch (err) {
        console.error('Ошибка при загрузке устройств:', err);
        setError('Произошла ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };
    fetchDevice();
  }, [id, items]);

  

  const addToOrder = (item) => {
  const isInArray = items.isOrders.some(el => el.id === item.id);
  if (!isInArray) {
    const newOrders = [...items.isOrders, item];
    items.setOrders(newOrders);
    localStorage.setItem('cartItems', JSON.stringify(newOrders));
  }
};

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Ошибка</h2>
        <p>{error}</p>
        <button 
          className={styles.backButton}
          onClick={() => navigate('/')}
        >
          Вернуться на главную
        </button>
      </div>
    );
  }

  if (!currentDevice) {
    return (
      <div className={styles.notFoundContainer}>
        <h2>Устройство не найдено</h2>
        <button 
          className={styles.backButton}
          onClick={() => navigate('/')}
        >
          Вернуться на главную
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button 
        className={styles.backButton}
        onClick={() => navigate(-1)}
      >
        &larr; Назад
      </button>

      <div className={styles.deviceWrapper}>
        <div className={styles.imageContainer}>
          <img 
            src={"../img/" + currentDevice.img} 
            alt={currentDevice.name} 
            className={styles.deviceImage}
          />
        </div>

        <div className={styles.infoContainer}>
          <h1 className={styles.title}>{currentDevice.name}</h1>
          
          <div className={styles.priceSection}>
            <span className={styles.price}>{currentDevice.price} BYN</span>
            {currentDevice.oldPrice && (
              <span className={styles.oldPrice}>{currentDevice.oldPrice} ₽</span>
            )}
          </div>

          <div className={styles.rating}>
            {'★'.repeat(Math.round(currentDevice.rating || 0)).padEnd(5, '☆')}
            <span>({currentDevice.rating || 0})</span>
          </div>

          <div className={styles.description}>
            <h3>Описание</h3>
            <p>{currentDevice.description || 'Описание отсутствует'}</p>
          </div>

          <div className={styles.characteristics}>
            <h3>Характеристики</h3>
            <ul>
              {currentDevice.info?.map((info, index) => (
                <li key={index}>
                  <strong>{info.title}:</strong> {info.desc}
                </li>
              ))}
            </ul>
          </div>
          
          {items.isOrders.some(el => el.id === currentDevice.id) 
              ? <button 
              className={styles.addToCartButton} 
              onClick={() => navigate('/basket')}
              >Перейти в корзину
              </button>
              : 
              <button 
              className={styles.addToCartButton} 
              onClick={() => addToOrder(currentDevice)}
              >Добавить в корзину</button>
              }

        </div>
      </div>
    </div>
  );
});

export default DevicePage;