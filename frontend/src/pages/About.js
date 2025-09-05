import React, { Component } from 'react';
import { Container, Row, Col, Card, Image, Badge } from 'react-bootstrap';
import { FaTools, FaTruckPickup, FaShieldAlt, FaChartLine, FaHandshake } from 'react-icons/fa';

class About extends Component {
  render() {
    return (
      <Container className="my-5">
        {/* Hero секция */}
        <Row className="align-items-center mb-5">
          <Col md={6}>
            <h1 className="display-4 mb-4">
              <Badge bg="primary">Art Rent</Badge> - профессиональная аренда техники
            </h1>
            <p className="lead">
              Мы предоставляем в аренду строительное оборудование и автомобильную технику 
              для профессионалов и частных клиентов с 2010 года.
            </p>
          </Col>
          <Col md={6}>
            <Image 
              src="https://via.placeholder.com/600x400?text=Строительная+техника" 
              alt="Строительная техника" 
              fluid 
              rounded 
              className="shadow"
            />
          </Col>
        </Row>

        {/* О компании */}
        <section className="mb-5 py-4 bg-light rounded">
          <h2 className="text-center mb-4">О нашей компании</h2>
          <Row>
            <Col md={6} className="mb-4">
              <p>
                <strong>Art Rent</strong> - это современная компания по аренде специализированной техники, 
                основанная в Минске. За годы работы мы расширили парк оборудования до 500+ единиц 
                и обслужили более 10 000 клиентов.
              </p>
              <p>
                Наша миссия - сделать аренду техники простой, выгодной и безопасной для всех 
                категорий клиентов.
              </p>
            </Col>
            <Col md={6}>
              <Image 
                src="https://via.placeholder.com/600x400?text=Наша+команда" 
                alt="Наша команда" 
                fluid 
                rounded 
                className="shadow"
              />
            </Col>
          </Row>
        </section>

        {/* Наши направления */}
        <section className="mb-5">
          <h2 className="text-center mb-4">Направления аренды</h2>
          <Row className="g-4">
            <Col md={6}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="text-center">
                  <FaTools className="display-4 text-primary mb-3" />
                  <Card.Title>Строительное оборудование</Card.Title>
                  <Card.Text>
                    Полный спектр оборудования для строительства и ремонта: 
                    бетономешалки, леса, опалубка, генераторы, компрессоры, 
                    строительный инструмент и многое другое.
                  </Card.Text>
                  <Badge bg="success" className="fs-6">Более 200 единиц</Badge>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="text-center">
                  <FaTruckPickup className="display-4 text-primary mb-3" />
                  <Card.Title>Автомобильная техника</Card.Title>
                  <Card.Text>
                    Спецтранспорт для любых задач: самосвалы, автокраны, 
                    манипуляторы, экскаваторы, погрузчики, автовышки и другая 
                    специализированная техника.
                  </Card.Text>
                  <Badge bg="success" className="fs-6">Более 150 единиц</Badge>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </section>

        {/* Наши преимущества */}
        <section className="mb-5">
          <h2 className="text-center mb-4">Почему выбирают Art Rent?</h2>
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 border-0">
                <Card.Body className="text-center">
                  <FaShieldAlt className="display-4 text-primary mb-3" />
                  <Card.Title>Надежность</Card.Title>
                  <Card.Text>
                    Все оборудование проходит регулярное техническое обслуживание 
                    и проверку перед каждой арендой.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 border-0">
                <Card.Body className="text-center">
                  <FaChartLine className="display-4 text-primary mb-3" />
                  <Card.Title>Экономия</Card.Title>
                  <Card.Text>
                    Гибкие тарифы и специальные условия для постоянных клиентов. 
                    Аренда выгоднее покупки!
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 border-0">
                <Card.Body className="text-center">
                  <FaHandshake className="display-4 text-primary mb-3" />
                  <Card.Title>Поддержка</Card.Title>
                  <Card.Text>
                    Круглосуточная поддержка клиентов, помощь в выборе техники 
                    и консультации по эксплуатации.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </section>

        {/* Статистика */}
        <section className="py-4 bg-primary text-white rounded mb-5">
          <Row className="text-center">
            <Col md={3} className="mb-3">
              <h3 className="display-5">12+</h3>
              <p>Лет на рынке</p>
            </Col>
            <Col md={3} className="mb-3">
              <h3 className="display-5">500+</h3>
              <p>Единиц техники</p>
            </Col>
            <Col md={3} className="mb-3">
              <h3 className="display-5">10 000+</h3>
              <p>Довольных клиентов</p>
            </Col>
            <Col md={3} className="mb-3">
              <h3 className="display-5">24/7</h3>
              <p>Поддержка клиентов</p>
            </Col>
          </Row>
        </section>
      </Container>
    );
  }
}

export default About;