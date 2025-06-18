import React, { useContext, useState } from 'react'
import { Container, Card, Form, Button, Row } from 'react-bootstrap'
import { LOGIN_ROUTE, REGISTRATION_ROUTE, SHOP_ROUTE } from '../utils/consts'
import { NavLink, useLocation, useNavigate  } from 'react-router-dom'
import { login, registration } from '../http/userApi'
import { observer } from 'mobx-react-lite'
import { Context } from '..';


const Auth =  observer( () => {
  const {user} = useContext(Context)
  const {items} = useContext(Context)
  const location = useLocation()
  const navigate = useNavigate()
  const isLogin = location.pathname === LOGIN_ROUTE
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const click = async () => {
    try {
      let data;
      if (isLogin) {
        data = await login(email, password);
      } else {
        data = await registration(name, email, password);
      }
      user.setUser(data)
      user.setIsAuth(true)
      console.log(user)
      navigate(SHOP_ROUTE)
    } catch (e){
      alert(e.response.data.message)
    } 
  }

  return (
    <Container className="cont-form" >
      <Card className="cont-card">
        <h2>{isLogin ? 'Авторизация' : 'Регистрация'}</h2>
        <Form className='form'>
        {isLogin ?
            <div>
            </div>
            :
            <Form.Control
              placeholder='Введите name...'
              value={name}
              onChange={e => setName(e.target.value)}
            />
            }
          <Form.Control
            placeholder='Введите email...'
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Form.Control
            placeholder='Введите пароль...'
            value={password}
            onChange={e => setPassword(e.target.value)}
            type='password'
          />
          <Row>
          {isLogin ?
            <div>
              Нет аккаунта? <NavLink to={REGISTRATION_ROUTE}>Зарегистрируйтесь!</NavLink>
            </div>
            :
            <div>
              Есть аккаунт? <NavLink to={LOGIN_ROUTE}>Войдите!</NavLink>
            </div>
            }
            
            <Button onClick={click}>
              {isLogin ? 'Войти' : 'Зарегистрироваться'}
            </Button>           
          </Row>
        </Form>
      </Card>
    </Container>
  )
});

export default Auth