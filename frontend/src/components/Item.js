import { observer } from 'mobx-react-lite';
import React, { useContext, useState, useEffect } from 'react';
import { Context } from '../index';
import { favoriteUser, favoriteDelete, favoriteAdd } from '../http/userApi';

const Item = observer(({ item, onShowItem, onAdd }) => {
  const { user } = useContext(Context);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user.isAuth) {
        try {
          const resFav = await favoriteUser();
          const favorites = resFav.data;
          setIsFavorite(favorites.some(fav => fav.device === item.id));
        } catch (err) {
          console.error('Ошибка при загрузке избранного:', err);
        }
      }
    };
    
    checkFavoriteStatus();
  }, [user.isAuth, item.id]);

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    if (!user.isAuth) return;
    
    setLoading(true);
    try {
      if (isFavorite) {
        await favoriteDelete(item.id);
        setIsFavorite(false);
      } else {
        await favoriteAdd(item.id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Ошибка при изменении избранного:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='item'>
      <div className="item-header">
        <img 
          src={"./img/" + item.img} 
          alt={item.title}
          onClick={() => onShowItem(item)}
        />
        {user.isAuth && (
          <div 
            className={`favorite-heart ${isFavorite ? 'active' : ''} ${loading ? 'loading' : ''}`} 
            onClick={handleToggleFavorite}
          >
            {loading ? '...' : '♥'}
          </div>
        )}
      </div>
      <h2>{item.title}</h2>
      <b>Цена: {item.price} BYN/сутки</b>
      <div 
        className='add-to-card' 
        onClick={() => onAdd(item)}
      >
        Добавить
      </div>
      <div className='pres'> 
        <a href={"./device/" + item.id}>Подробнее</a>
      </div>
    </main>
  );
});

export default Item;