import React, { Component } from 'react'

export class ShowFullItem extends Component {
  render() {
    return (
      <div className='full-item'> 
        <div className='item'>
            <button className='close-to-card' onClick={() => this.props.onShowItem(this.props.item)}></button>
            <img src={"./img/" + this.props.item.img} onClick={() => this.props.onShowItem(this.props.item)}/>
            <h2>{this.props.item.title}</h2>
            <p>{this.props.item.desc}</p>
            <b>Цена:{this.props.item.price}  BYN/сутки</b>
            <div className='add-to-card' onClick={() => this.props.onAdd(this.props.item)}>Добавить</div>
            <div className='pres'> <a href= {"./device/" + this.props.item.id}>Подробнее</a></div>
        </div>
      </div>
    )
  }
}

export default ShowFullItem
