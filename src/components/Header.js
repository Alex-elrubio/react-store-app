import styles from "styles/Header.module.scss";
import { Link } from "react-router-dom";
import GetIcon from "components/GetIcon";
import clsx from "clsx";
import CategoryItem from "./CategoryItem";
import { BasketContext } from "context/BasketContext";
import { useContext } from "react";
import {CATEGORY_FIND} from 'apollo/queries';
import {useQuery} from "@apollo/client";
import _ from 'lodash';

const Header = () => {
  const { basketItems, setBasketIsOpen } = useContext(BasketContext);
  const {data} = useQuery(CATEGORY_FIND, {variables: {query: "[{\"parent\":null}]"}});

  console.log(data)

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">
          <h2>react store</h2>
        </Link>
      </div>
      <div className={styles.navContainer}>
        <nav className={styles.nav}>
          <ul>
            <li>
              <Link to="/" onClick={(e) => e.preventDefault()} className={styles.a}>
                Categories
              </Link>
              <ul className={styles.subMenu}>{_.get(data, 'CategoryFind', []).map((cat, index) => <CategoryItem data={cat} key={index} />)}</ul>
            </li>
            <li>
              <Link
                to="/"
                className={clsx(styles.basketBtn, styles.a)}
                onClick={(e) => {
                  e.preventDefault();
                  setBasketIsOpen((oldState) => !oldState);
                }}
              >
                <GetIcon icon="BsCart4" size={25} color="#ffffff" />
                {basketItems.length > 0 && <span className={styles.basketLength}> {basketItems.length} </span>}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
