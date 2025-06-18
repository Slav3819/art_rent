import { useState, useEffect, useContext } from 'react';
import { device } from '../http/deviceApi';
import { observer } from 'mobx-react-lite';
import { Context } from '../index';
import { useParams } from 'react-router-dom';
import DeviceFull from '../components/DeviceFull';

const DevicePage = observer(() => {
  const { items } = useContext(Context);
  const { id } = useParams();
  const [currentDevice, setCurrentDevice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    device()
      .then(res => {
        items.setItems(res.data);
        // Находим устройство по ID из URL
        const foundDevice = res.data.find(el => el.id.toString() === id);
        if (foundDevice) {
          setCurrentDevice(foundDevice);
        } else {
          console.error(`Устройство с ID ${id} не найдено`);
        }
      })
      .catch(err => {
        console.error('Ошибка при загрузке устройств:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]); // Добавляем id в зависимости useEffect

  const addToOrder = (item) => {
    const isInArray = items.isOrders.some(el => el.id === item.id);
    if (!isInArray) {
      items.setOrders([...items.isOrders, item]);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!currentDevice) {
    return <div>Устройство не найдено</div>;
  }

  return (
    <div className="shop-container">
      <div className='wrapper'>
        <div className="shop-content">
          <div className="items-container">
            <DeviceFull
              item={currentDevice} 
              onAdd={addToOrder} 
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default DevicePage;