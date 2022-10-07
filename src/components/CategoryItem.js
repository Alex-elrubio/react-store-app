import styles from "styles/CategoryItem.module.scss";
import { Link } from "react-router-dom";
import linkBG from "images/shopBG.jpg";

const CategoryItem = ({ data, setNavIsOpen }) => {
  return (
    <li className={styles.item}>
      <Link to={`/category/${data._id}`} className={styles.sub_a} onClick={() => setNavIsOpen(false)}>
        <img src={data.image? data.image.url : linkBG} alt="" />
        <h3>{data.name}</h3>
      </Link>
    </li>
  );
};

export default CategoryItem;
