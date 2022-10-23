import { action, makeObservable, observable, computed } from 'mobx';

class CartStore {
  constructor() {
    makeObservable(this, {
      items: observable,
      addItem: action,
      count: computed,
    });
  }

  items = [];

  get count() {
    return this.items.length;
  }

  addItem(product) {
    this.items = this.items.concat(product);
  }
}

export default new CartStore();
