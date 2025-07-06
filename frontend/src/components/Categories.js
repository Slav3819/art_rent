import React, { Component } from 'react'

export class Categories extends Component {
    constructor(props) {
        super(props)
        this.state = {
            categories: [
                {
                    key: 'all',
                    name: 'Все'
                },
                {
                    key: 'drill',
                    name: 'дрель'
                },
                {
                    key: 'sma',
                    name: 'ушм'
                },
                {
                    key: 'kosa',
                    name: 'Косилки'
                },
                {
                    key: 'shur',
                    name: 'Гайковерты'
                },
                {
                    key: 'hammer',
                    name: 'Перфораторы'
                },
                
            ]
        }

    }
  render() {
    return (
      <div className='categories'>
        {this.state.categories.map(el => (
            <div key={el.key} onClick={() => this.props.chooseCategory(el.key)}>{el.name}</div>
        ))}
      </div>
    )
  }
}

export default Categories
