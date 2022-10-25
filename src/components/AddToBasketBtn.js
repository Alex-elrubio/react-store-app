import styles from "styles/AddToBasketBtn.module.scss";
import GetIcon from "components/GetIcon";
import cartStore from "stores/cartStore";

const AddToBasketBtn = ({ data: product }) => {
  const addToBasket = (product) => {
    cartStore.addProduct(product);
  };

  return (
    <button
      className={styles.addToBasket}
      onClick={(e) => {
        e.preventDefault();
        addToBasket(product);
      }}
    >
      <GetIcon icon="BsFillCartPlusFill" size={18} /> add to basket
    </button>
  );
};

export default AddToBasketBtn;
