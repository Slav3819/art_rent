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
                    key: 'ts',
                    name: 'ушм'
                },
                {
                    key: 'tс',
                    name: 'Косилки'
                },
                {
                    key: 'gz',
                    name: 'Гайковерты'
                },
                {
                    key: 'pf',
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
