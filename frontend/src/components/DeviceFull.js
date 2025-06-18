import React, { Component } from 'react'

export class DeviceFull extends Component {
  render() {
    return (
      <main className='item'>
        <img src={"../img/" + this.props.item.img} onClick={() => this.props.onShowItem(this.props.item)}/>
        <h2>{this.props.item.title}</h2>
        <p>{this.props.item.desc}</p>
        <b>{this.props.item.price} BYN</b>
        <div className='add-to-card' onClick={() => this.props.onAdd(this.props.item)}>Добавить</div>
      </main>
    )
  }
}

export default DeviceFull
