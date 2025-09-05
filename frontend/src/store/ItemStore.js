import { makeAutoObservable } from "mobx";

export default class ItemStore {
    constructor() {
        this._isOrders = [];
        this._isItems = [];
        makeAutoObservable(this);
        this.loadOrders(); // Загружаем сохранённые заказы при создании хранилища
    }

    // Загружаем заказы из localStorage
    loadOrders() {
        try {
            const savedOrders = localStorage.getItem("cartItems");
            if (savedOrders) {
                this._isOrders = JSON.parse(savedOrders);
            }
        } catch (error) {
            console.error("Ошибка при загрузке корзины из localStorage:", error);
        }
    }

    // Сохраняем заказы в localStorage при изменении
    saveOrders() {
        localStorage.setItem("cartItems", JSON.stringify(this._isOrders));
    }

    setItems(items) {
        this._isItems = items;
    }

    setOrders(orders) {
        this._isOrders = orders;
        this.saveOrders(); // Автоматически сохраняем при обновлении
    }

    get isItems() {
        return this._isItems;
    }

    get isOrders() {
        return this._isOrders;
    }
}