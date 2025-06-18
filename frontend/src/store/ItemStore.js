import { makeAutoObservable } from "mobx";

export default class ItemStore {
    constructor() {
        this._isOrders = []
        this._isItems = []
        makeAutoObservable(this)
    }

    setItems(items) {
      this._isItems = items
  }

    setOrders(orders) {
    this._isOrders = orders
}

    get isItems() {
      return this._isItems
    }

    get isOrders() {
      return this._isOrders
    }

    

}