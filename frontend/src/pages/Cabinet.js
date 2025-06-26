import { useState, useEffect } from 'react';
import { ordersUser } from '../http/userApi';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Nav, 
  Form, 
  Button, 
  Alert, 
  Table,
  Badge,
  Spinner
} from 'react-bootstrap';
import { 
  FaUser as Person,
  FaShoppingCart as CartCheck,
  FaHeart as Heart,
  FaCog as Gear,
  FaEdit as Pencil,
  FaCheck as Check,
  FaTrash as Trash,
  FaBell as Bell
} from 'react-icons/fa';
import './Cabinet.css'; // Создадим отдельный файл стилей

const Cabinet = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: 'Иван Иванов',
    email: 'user@example.com',
    phone: '+375 (29) 123-45-67'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState(true);

  const favorites = [
    { id: 1, name: 'Товар 1', price: 50 },
    { id: 2, name: 'Товар 2', price: 75 },
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await ordersUser();
        setOrders(response.data);
      } catch (err) {
        setError('Ошибка загрузки заказов');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleProfileSave = () => {
    setIsEditing(false);
    // API запрос на сохранение данных
  };

  const Status = (status) => {
    if (status === "in_progress") {
      return true
    } else {
      return false
    }
  }

  const dateCreate = (date_create) => {
    console.log(date_create)
    return new Date(date_create).toLocaleDateString('ru-RU')
  } 

  return (
    <Container className="cabinet-container">
      <h1 className="cabinet-title">Личный кабинет</h1>
      
      <Row className="g-4">
        <Col md={3}>
          <Card className="sidebar-card">
            <Card.Body>
              <Nav variant="pills" className="flex-column gap-2">
                <Nav.Link 
                  active={activeTab === 'profile'}
                  onClick={() => setActiveTab('profile')}
                  className="nav-link-custom"
                >
                  <Person className="me-2" /> Профиль
                </Nav.Link>
                
                <Nav.Link 
                  active={activeTab === 'orders'}
                  onClick={() => setActiveTab('orders')}
                  className="nav-link-custom"
                >
                  <CartCheck className="me-2" /> Мои заказы
                  {orders.length > 0 && (
                    <Badge pill bg="primary" className="ms-2">
                      {orders.length}
                    </Badge>
                  )}
                </Nav.Link>
                
                <Nav.Link 
                  active={activeTab === 'favorites'}
                  onClick={() => setActiveTab('favorites')}
                  className="nav-link-custom"
                >
                  <Heart className="me-2" /> Избранное
                  {favorites.length > 0 && (
                    <Badge pill bg="danger" className="ms-2">
                      {favorites.length}
                    </Badge>
                  )}
                </Nav.Link>
                
                <Nav.Link 
                  active={activeTab === 'settings'}
                  onClick={() => setActiveTab('settings')}
                  className="nav-link-custom"
                >
                  <Gear className="me-2" /> Настройки
                </Nav.Link>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        <Col md={9}>
          <Card className="content-card">
            <Card.Body className="p-4">
              {activeTab === 'profile' && (
                <div className="profile-section">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="section-title">
                      <Person className="me-2" />Мой профиль
                    </h4>
                    {isEditing ? (
                      <Button 
                        variant="success" 
                        size="sm"
                        onClick={handleProfileSave}
                        className="action-btn"
                      >
                        <Check className="me-1" /> Сохранить
                      </Button>
                    ) : (
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="action-btn"
                      >
                        <Pencil className="me-1" /> Редактировать
                      </Button>
                    )}
                  </div>

                  <Form className="profile-form">
                    <Form.Group className="mb-3 form-group-custom">
                      <Form.Label>Имя</Form.Label>
                      <Form.Control
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        disabled={!isEditing}
                        className="form-control-custom"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3 form-group-custom">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        disabled={!isEditing}
                        className="form-control-custom"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3 form-group-custom">
                      <Form.Label>Телефон</Form.Label>
                      <Form.Control
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        disabled={!isEditing}
                        className="form-control-custom"
                      />
                    </Form.Group>
                  </Form>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="orders-section">
                  <h4 className="section-title mb-4">
                    <CartCheck className="me-2" />Мои заказы
                  </h4>
                  
                  {loading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" variant="primary" />
                    </div>
                  ) : error ? (
                    <Alert variant="danger">{error}</Alert>
                  ) : orders.length > 0 ? (
                    <div className="table-responsive">
                      <Table striped hover className="orders-table">
                        <thead>
                          <tr>
                            <th>№</th>
                            <th>Дата</th>
                            <th>Сумма</th>
                            <th>Статус</th>
                            <th>Действия</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(order => (
                            <tr key={order.id}>
                              <td>{order.id}</td>
                              {/* <td>{order.created_at}</td> */}
                              <td>{dateCreate(order.created_at)}</td>
                              <td>{order.total} BYN</td>
                              <td>
                                <Badge 
                                  bg={
                                    order.status === 'Доставлен' ? 'success' :
                                    order.status === 'Отменен' ? 'danger' : 'warning'
                                  }
                                  className="status-badge"
                                >
                                  {Status(order.status) ? <p>В работе</p> : <p>v</p> }
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <Alert variant="info" className="empty-alert">
                      У вас пока нет заказов
                    </Alert>
                  )}
                </div>
              )}

              {activeTab === 'favorites' && (
                <div className="favorites-section">
                  <h4 className="section-title mb-4">
                    <Heart className="me-2" />Избранное
                  </h4>
                  
                  {favorites.length > 0 ? (
                    <Row xs={1} md={2} lg={3} className="g-4">
                      {favorites.map(item => (
                        <Col key={item.id}>
                          <Card className="favorite-card h-100">
                            <Card.Body className="text-center">
                              <Card.Title className="favorite-title">{item.name}</Card.Title>
                              <Card.Text className="favorite-price">
                                {item.price} BYN
                              </Card.Text>
                              <div className="d-flex justify-content-center gap-2">
                                <Button variant="primary" size="sm">
                                  В корзину
                                </Button>
                                <Button variant="outline-danger" size="sm">
                                  <Trash />
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Alert variant="info" className="empty-alert">
                      Список избранного пуст
                    </Alert>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="settings-section">
                  <h4 className="section-title mb-4">
                    <Gear className="me-2" />Настройки
                  </h4>
                  
                  <div className="mb-4 setting-item">
                    <Form.Check 
                      type="switch"
                      id="notifications-switch"
                      label={
                        <>
                          <Bell className="me-2" />
                          Получать уведомления
                        </>
                      }
                      checked={notifications}
                      onChange={() => setNotifications(!notifications)}
                      className="setting-switch"
                    />
                  </div>

                  <div className="danger-zone border-top pt-4 mt-4">
                    <h5 className="text-danger mb-3">
                      <Trash className="me-2" />
                      Опасная зона
                    </h5>
                    <Button variant="outline-danger" className="danger-btn">
                      Удалить аккаунт
                    </Button>
                    <p className="text-muted mt-2 small">
                      Это действие нельзя отменить. Все ваши данные будут удалены.
                    </p>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cabinet;