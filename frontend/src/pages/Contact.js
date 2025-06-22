import React, { Component } from 'react';
import './Contact.css'; // Подключаем файл стилей

export class Contact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      message: ''
    };
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    //добавить логику отправки формы
    console.log('Форма отправлена:', this.state);
    alert('Сообщение отправлено!');
    this.setState({ name: '', email: '', message: '' });
  };

  render() {
    return (
      <div className="contact-container">
        <h1>Свяжитесь с нами</h1>
        
        <div className="contact-info">
          <div className="info-item">
            <h3>Адрес</h3>
            <p>ул. Примерная, 123, г. Примерный</p>
          </div>
          <div className="info-item">
            <h3>Телефон</h3>
            <p>+375 (12) 345-67-89</p>
          </div>
          <div className="info-item">
            <h3>Email</h3>
            <p>contact@artrent.com</p>
          </div>
        </div>

        <form onSubmit={this.handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="name">Имя:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={this.state.name}
              onChange={this.handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={this.state.email}
              onChange={this.handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Сообщение:</label>
            <textarea
              id="message"
              name="message"
              value={this.state.message}
              onChange={this.handleInputChange}
              required
            />
          </div>
          
          <button type="submit" className="submit-btn">Отправить</button>
        </form>
      </div>
    );
  }
}

export default Contact;