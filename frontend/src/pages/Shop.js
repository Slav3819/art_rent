import { useState, useEffect, useContext } from 'react';
import Items from '../components/Items';
import Categories from '../components/Categories';
import ShowFullItem from '../components/ShowFullItem';
import Slider from '../components/Slider';
import { device } from '../http/deviceApi';
import { observer } from 'mobx-react-lite';
import { Context } from '../index';

const Shop = observer(() => {
  const [orders, setOrders] = useState([]);
  const [currentItems, setCurrentItems] = useState([]);
  const [showFullItem, setShowFullItem] = useState(false);
  const [fullItem, setFullItem] = useState({});
  const [details, setDetails] = useState([]);
  const {items} = useContext(Context);

  // Восстановление корзины из localStorage при загрузке
  useEffect(() => {
    const savedOrders = localStorage.getItem('cartItems');
    if (savedOrders) {
      items.setOrders(JSON.parse(savedOrders));
    }

    device()
      .then(res => {
        setCurrentItems(res.data);
        items.setItems(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  // Сохранение корзины в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(items.isOrders));
  }, [items.isOrders]);

  const onShowItem = (item) => {
    setFullItem(item);
    setShowFullItem(!showFullItem);
  };

  const chooseCategory = (category) => {
    if (category === 'all') {
      setCurrentItems(items.isItems);
      return;
    } 
    setCurrentItems(items.isItems.filter(el => el.category === category));
  };

  const addToOrder = (item) => {
    const isInArray = items.isOrders.some(el => el.id === item.id);
    if (!isInArray) {
      items.setOrders([...items.isOrders, item]);
    }
  };

  return (
    <div className="shop-container">
      <div className='wrapper'>
        <Slider />
        <div className="shop-content">
          <div className="categories-sidebar">
            <Categories chooseCategory={chooseCategory} />
          </div>
          <div className="items-container">
            <Items 
              onShowItem={onShowItem} 
              items={currentItems} 
              onAdd={addToOrder} 
            />
          </div>
        </div>
        {showFullItem && (
          <ShowFullItem 
            item={fullItem} 
            onAdd={addToOrder} 
            onShowItem={onShowItem}
          />
        )}
      </div>
    </div>
  );
});

export default Shop;