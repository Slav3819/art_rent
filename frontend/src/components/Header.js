import React, { useContext, useState } from 'react'
import { FaShoppingCart } from "react-icons/fa";
import Order from './Order'
import { Context } from '../index';
import { observer } from 'mobx-react-lite';
import { logout } from '../http/userApi';



const showOrders = (props) => { 
  let summa = 0
  props.orders.forEach(element => {
    summa += Number.parseFloat(element.price)
  });
  return (<div>
    {props.orders.map(el => (
      <Order key={el.id} item={el} onDelete={props.onDelete} />
    ))}
    
    <p className='summa'> Сумма: {new Intl.NumberFormat().format(summa)} BYN <button className='open-card-btn'> <a href="/basket">Открыть корзину</a></button></p>
    
      
  </div>)
}

const showNothing = () => {
  return (
    <div className='empty'>
      <h2>Товаров нет!</h2>
    </div>
  )
}

const Header = (props) => {
  let [cartOpen, setCartOpen] = useState(false)
  const {user} = useContext(Context)

  const logOut = () => {
  logout();
  user.setUser({});
  user.setIsAuth(false);
  window.location.href = '/';
}
  
  return (
    <header>
        <div >
            <span className='logo'> <a href="/" >Art Rent</a> </span>
            <ul className='nav' >
                <li> <a href="/">Главная</a></li>
                <li> <a href="/about">Про нас</a></li>
                <li> <a href="/contact">Контакты</a></li>
                <li> {user.isAuth ?
                <div> 
                  <a href="/cabinet">
                  <button className='hd-button-cab'>Кабинет</button>
                  </a>
                  <button className='hd-button-cab' onClick={() => logOut()} >Выйти</button>
                </div>
              :
                <div> 
                  <a href="/login">
                    <button className='hd-button-cab' >Войти</button>
                  </a>
                </div>
              }
              </li>
            </ul>           
            <FaShoppingCart onClick={() => setCartOpen(cartOpen = !cartOpen)}  className={`shop-cart-button ${cartOpen && 'active'}`}/>

            {cartOpen &&  (
              <div className='shop-cart'>
                {props.orders.length > 0 ? showOrders(props) : showNothing()}
              </div>
            )}
        
        </div>
    </header>
  )
}
export default observer(Header);