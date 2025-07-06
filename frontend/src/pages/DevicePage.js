import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../index';
import { device } from '../http/deviceApi';
import styles from './DevicePage.module.css';
import { favoriteUser, favoriteDelete, favoriteAdd } from '../http/userApi'

const DevicePage = observer(() => {
  const { user, items } = useContext(Context);
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentDevice, setCurrentDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fav, setFav] = useState()

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

    const fetchFavorites = async () => {
      if (user.isAuth)
        try {
          const resFav = await favoriteUser()
          setFav(resFav.data)
        } catch (err) {
          console.error('Ошибка при загрузке списка:', err);
          setError('Произошла ошибка при загрузке данных');
        }
      }

    fetchFavorites();

    fetchDevice();
  }, [id, items]);

  const favoriteToAdd = async (id) => {
  try {
    await favoriteAdd(id);
    setFav(prev => [...prev, { device: id }]); // Добавляем устройство в избранное
  } catch (err) {
    console.error('Ошибка при добавлении в избранное:', err);
  }
}

const favoriteToDelete = async (id) => {
  try {
    await favoriteDelete(id);
    setFav(prev => prev.filter(item => item.device !== id)); // Удаляем устройство из избранного
  } catch (err) {
    console.error('Ошибка при удалении из избранного:', err);
  }
}

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
          <h1 className={styles.title}>{currentDevice.title}</h1>
          
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
            <p>{currentDevice.desc || 'Описание отсутствует'}</p>
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

          {user.isAuth ? (
            fav?.some(el => el.device === currentDevice.id) ? (
              <button 
                className={styles.addToCartButton} 
                onClick={() => favoriteToDelete(currentDevice.id)}
              >
                Удалить из избранного
              </button>
            ) : (
              <button 
                className={styles.addToCartButton} 
                onClick={() => favoriteToAdd(currentDevice.id)}
              >
                Добавить в избранное
              </button>
            )
          ) : (
            <button 
              className={styles.addToCartButton} 
              onClick={() => navigate('/login')}
            >
              Войти
            </button>
          )}
             

        </div>
      </div>
    </div>
  );
});

export default DevicePage;