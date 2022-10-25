import styles from "styles/Quantity.module.scss";
import GetIcon from "components/GetIcon";
import { useRef, useEffect } from "react";
import cartStore from 'stores/cartStore';
import {observer} from 'mobx-react';

const Quantity = ({ data }) => {
  const inp = useRef("inp");

  useEffect(() => {
    inp.current.value = data.quantity || 1;
  }, [data.quantity]);

  return (
    <div className={styles.quantity}>
      <button type="button" className={styles.quantityBtn} onClick={() => cartStore.substractProduct(data.product)}>
        <GetIcon icon="BsDash" size={20} />
      </button>
      <input type="number" min="1" max="10" defaultValue={1} ref={inp} />
      <button type="button" className={styles.quantityBtn} onClick={() => cartStore.addProduct(data.product)}>
        <GetIcon icon="BsPlus" size={20} />
      </button>
    </div>
  );
};

export default observer(Quantity);
