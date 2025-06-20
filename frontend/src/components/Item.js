import React, { Component } from 'react'

export class Item extends Component {
  render() {
    return (
      <main className='item'>
        <img src={"./img/" + this.props.item.img} onClick={() => this.props.onShowItem(this.props.item)}/>
        <h2>{this.props.item.title}</h2>
        {/* <p>{this.props.item.desc}</p> */}
        <b>Цена: {this.props.item.price} BYN/сутки</b>
        <div className='add-to-card' onClick={() => this.props.onAdd(this.props.item)}>Добавить</div>
        <div className='pres'> <a href= {"./device/" + this.props.item.id}>Подробнее</a></div>
      </main>
    )
  }
}

export default Item
