import styles from "styles/BasketSidebar.module.scss";
import emptyCardImg from "images/empty_cart.svg";
import GetIcon from "components/GetIcon";
import {observer} from 'mobx-react';
import Title from "components/Title";
import clsx from "clsx";
import BasketItem from "components/BasketItem";
import { useRef } from "react";
import cartStore from 'stores/cartStore';

const BasketSidebar = () => {
  const container = useRef();

  return (
    <div
      className={clsx(styles.sidebarContainer, cartStore.isOpen ? styles.show : styles.hide)}
      ref={container}
      onClick={(event) => event.target === container.current && cartStore.setIsOpen(false)}
    >
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <div className={styles.title}>
            <Title txt="your basket" size={20} transform="uppercase" />
            {<small>your basket has got {cartStore.count} items</small>}
          </div>
          <button className={styles.close} onClick={() => cartStore.setIsOpen(false)}>
            <GetIcon icon="BsX" size={30} />
          </button>
        </div>
        {cartStore.count > 0 ? (
          <>
            <div className={styles.items}>
              {cartStore.items?.map((item, key) => (
                <BasketItem data={item} key={key} />
              ))}
            </div>
            <div className={styles.basketTotal}>
              <div className={styles.total}>
                <Title txt="basket summary" size={23} transform="uppercase" />
                <GetIcon icon="BsFillCartCheckFill" size={25} />
              </div>
              <div className={styles.totalPrice}>
                <small>total try</small>
                <div className={styles.price}>
                  <span>{cartStore.total.toFixed(2)}</span>
                </div>
              </div>
              <button type="button" className={styles.confirmBtn}>
                Confirm the basket
              </button>
            </div>
          </>
        ) : (
          <div className={styles.emptyBasket}>
            <img src={emptyCardImg} alt="" />
            <Title txt="your basket is empty" size={23} transform="uppercase" />
          </div>
        )}
      </div>
    </div>
  );
};

export default observer(BasketSidebar);
