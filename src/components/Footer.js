import styles from "styles/Footer.module.scss";
import GetIcon from "components/GetIcon";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <p>
        <GetIcon icon="BsFillHeartFill" size={22} color="#da0037" /> <a href="http://gitlab.a-level.com.ua/Alex.ElRubio">Larychev Oleksandr</a>
      </p>
    </footer>
  );
};

export default Footer;
