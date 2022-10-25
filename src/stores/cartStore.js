import { action, makeObservable, observable, computed } from 'mobx';

class CartStore {
  constructor() {
    makeObservable(this, {
      items: observable,
      isOpen: observable,
      addProduct: action,
      substractProduct: action,
      removeProduct: action,
      setIsOpen: action,
      count: computed,
      total: computed,
    });
  }

  items = [];
  isOpen = false;

  get count() {
    return this.items.reduce((accumulator, item) => accumulator + item.quantity, 0);
  }

  get total() {
    return this.items.reduce((accumulator, item) => accumulator + (item.quantity * item.product.price), 0);
  }

  addProduct(product) {
    const index = this.items.findIndex(item => product._id === item.product._id);

    if (index !== -1) {
      this.items[index].quantity ++;
    } else {
      this.items = this.items.concat({product, quantity: 1});
    }
  }

  substractProduct(product) {
    const index = this.items.findIndex(item => product._id === item.product._id);

    if (index === -1) {
      return;
    }

    if (this.items[index].quantity > 1) {
      this.items[index].quantity--;
    } else {
      this.removeProduct(product);
    }
  }

  removeProduct(product) {
    this.items = this.items.filter(item => product._id !== item.product._id);
  }

  setIsOpen(state) {
    this.isOpen = state;
  }
}

export default new CartStore();
