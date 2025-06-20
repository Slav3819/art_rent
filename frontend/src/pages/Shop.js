import { useState, useEffect, useContext } from 'react';
import Items from '../components/Items';
import Categories from '../components/Categories';
import ShowFullItem from '../components/ShowFullItem';
import Slider from '../components/Slider';
import { devicePage } from '../http/deviceApi';
import { observer } from 'mobx-react-lite';
import { Context } from '../index';
import { useSearchParams } from 'react-router-dom';

const Shop = observer(() => {
  const [currentItems, setCurrentItems] = useState([]);
  const [showFullItem, setShowFullItem] = useState(false);
  const [fullItem, setFullItem] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const {items} = useContext(Context);

  

  useEffect(() => {
    const savedOrders = localStorage.getItem('cartItems');
    if (savedOrders) {
      items.setOrders(JSON.parse(savedOrders));
    }
    fetchItems();
  }, [currentPage]);


  const fetchItems = () => {
    setLoading(true);
    devicePage(currentPage)
      .then(res => {
        setCurrentItems(res.data.results);
        items.setItems(res.data.results);
        setTotalPages(res.data.total_pages);
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

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

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
            {loading ? (
              <div>Loading...</div>
            ) : (
              <>
                <Items 
                  onShowItem={onShowItem} 
                  items={currentItems} 
                  onAdd={addToOrder} 
                />
                <div className="pagination">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Предыдущая
                  </button>
                  
                  <span>Страница {currentPage} из {totalPages}</span>
                  
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Следующая
                  </button>
                </div>
              </>
            )}
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