import styles from "styles/Card.module.scss";
import { Link } from "react-router-dom";
import _ from 'lodash';
import {IMAGES_URL} from '../config';

import AddToBasketBtn from "components/AddToBasketBtn";

const Card = ({ product }) => {
  return (
    <div className={styles.card}>
      <Link to={`/product/${product._id}`} className={styles.content}>
        { !_.isEmpty(product.images) ?
          <div className={styles.img}>
          <img src={IMAGES_URL + product.images[0].url } alt="" />
        </div>
        : null}
        <div className={styles.info}>
          <div className={styles.title}>
            <h3>{product.name}</h3>
          </div>
          <div className={styles.footer}>
            {product.price ?
            (<div className={styles.price}>
              {product.price.toFixed(2)} <small>UAH</small>
            </div>)
            : null }
            <div className={styles.btn}>
              <AddToBasketBtn data={product} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Card;
