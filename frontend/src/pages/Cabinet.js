import React, { useState } from 'react';
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
  Badge
} from 'react-bootstrap';
// Альтернатива react-bootstrap-icons (если нет возможности установить)
import { 
  FaUser as Person,
  FaShoppingCart as CartCheck,
  FaHeart as Heart,
  FaCog as Gear,
  FaEdit as Pencil,
  FaCheck as Check,
  FaBell as Bell,
  FaTrash as Trash
} from 'react-icons/fa';

const Cabinet = () => {
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profile, setProfile] = useState({
    name: 'Иван Иванов',
    email: 'user@example.com',
    phone: '+375 (29) 123-45-67'
  });
  const [isEditing, setIsEditing] = useState(false);

  const orders = [
    { id: 1, date: '2023-10-01', total: 120, status: 'Доставлен' },
    { id: 2, date: '2023-10-15', total: 85, status: 'В обработке' },
  ];

  const favorites = [
    { id: 1, name: 'Товар 1', price: 50 },
    { id: 2, name: 'Товар 2', price: 75 },
  ];

  const [notifications, setNotifications] = useState(true);

  const handleProfileSave = () => {
    setIsEditing(false);
    // Здесь можно добавить API-запрос на сохранение
  };

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4">Личный кабинет</h1>
      
      <Row>
        <Col md={3} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Body className="p-3">
              <Nav variant="pills" className="flex-column gap-2">
                <Nav.Link 
                  active={activeTab === 'profile'}
                  onClick={() => setActiveTab('profile')}
                  className="d-flex align-items-center"
                >
                  <Person className="me-2" /> Профиль
                </Nav.Link>
                
                <Nav.Link 
                  active={activeTab === 'orders'}
                  onClick={() => setActiveTab('orders')}
                  className="d-flex align-items-center"
                >
                  <CartCheck className="me-2" /> Мои заказы
                </Nav.Link>
                
                <Nav.Link 
                  active={activeTab === 'favorites'}
                  onClick={() => setActiveTab('favorites')}
                  className="d-flex align-items-center"
                >
                  <Heart className="me-2" /> Избранное
                </Nav.Link>
                
                <Nav.Link 
                  active={activeTab === 'settings'}
                  onClick={() => setActiveTab('settings')}
                  className="d-flex align-items-center"
                >
                  <Gear className="me-2" /> Настройки
                </Nav.Link>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        <Col md={9}>
          <Card className="shadow-sm">
            <Card.Body>
              {activeTab === 'profile' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4><Person className="me-2" />Мой профиль</h4>
                    {isEditing ? (
                      <Button 
                        variant="success" 
                        size="sm"
                        onClick={handleProfileSave}
                      >
                        <Check className="me-1" /> Сохранить
                      </Button>
                    ) : (
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Pencil className="me-1" /> Редактировать
                      </Button>
                    )}
                  </div>

                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Имя</Form.Label>
                      <Form.Control
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        disabled={!isEditing}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        disabled={!isEditing}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Телефон</Form.Label>
                      <Form.Control
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        disabled={!isEditing}
                      />
                    </Form.Group>
                  </Form>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h4 className="mb-4"><CartCheck className="me-2" />Мои заказы</h4>
                  
                  {orders.length > 0 ? (
                    <Table striped hover responsive>
                      <thead>
                        <tr>
                          <th>№</th>
                          <th>Дата</th>
                          <th>Сумма</th>
                          <th>Статус</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.date}</td>
                            <td>{order.total} BYN</td>
                            <td>
                              <Badge 
                                bg={order.status === 'Доставлен' ? 'success' : 'warning'}
                              >
                                {order.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <Alert variant="info">
                      У вас пока нет заказов
                    </Alert>
                  )}
                </div>
              )}

              {activeTab === 'favorites' && (
                <div>
                  <h4 className="mb-4"><Heart className="me-2" />Избранное</h4>
                  
                  {favorites.length > 0 ? (
                    <Row xs={1} md={2} lg={3} className="g-4">
                      {favorites.map(item => (
                        <Col key={item.id}>
                          <Card className="h-100">
                            <Card.Body>
                              <Card.Title>{item.name}</Card.Title>
                              <Card.Text className="text-muted">
                                {item.price} BYN
                              </Card.Text>
                              <Button variant="outline-danger" size="sm">
                                Удалить
                              </Button>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Alert variant="info">
                      Список избранного пуст
                    </Alert>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h4 className="mb-4"><Gear className="me-2" />Настройки</h4>
                  
                  <div className="mb-4">
                    <Form.Check 
                      type="switch"
                      id="notifications-switch"
                      label="Получать уведомления"
                      checked={notifications}
                      onChange={() => setNotifications(!notifications)}
                    />
                  </div>

                  <div className="border-top pt-3">
                    <h5 className="text-danger mb-3">Опасная зона</h5>
                    <Button variant="outline-danger">
                      <Trash className="me-1" /> Удалить аккаунт
                    </Button>
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