import styles from "styles/BasketItem.module.scss";
import Title from "components/Title";
import GetIcon from "components/GetIcon";
import Quantity from "components/Quantity";
import cartStore from 'stores/cartStore';
import {observer} from 'mobx-react';
import {IMAGES_URL} from 'config';

const BasketItem = ({ data }) => {
  const {product} = data;

  return (
    <div className={styles.item}>
      <div className={styles.img}>
        {product.images[0] ? <img src={IMAGES_URL + product.images[0].url} alt="" /> : null}
      </div>
      <div className={styles.detail}>
        <div className={styles.title}>
          <Title txt={product.name} size={16} />
        </div>
        <div className={styles.priceContainer}>
          <small className={styles.singlePrice}>{product.price.toFixed(2)}</small>
          <small className={styles.quantityN}>{data.quantity}</small>
          <small className={styles.totalPrice}> {`${(product.price * data.quantity).toFixed(2)}`} UAH</small>
        </div>
        <Quantity data={data} />
      </div>
      <div className={styles.removeItem}>
        <button type="button" onClick={() => cartStore.removeProduct(data.product)}>
          <GetIcon icon="BsDash" size={17} />
        </button>
      </div>
    </div>
  );
};

export default observer(BasketItem);
