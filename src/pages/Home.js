import styles from "styles/Home.module.scss";
import Card from "components/Card";
import Title from "components/Title";
import { GOOD_FIND } from "apollo/queries";
import { useQuery } from "@apollo/client";
import _ from 'lodash';

const Home = () => {

  const {data, loading, error} = useQuery(GOOD_FIND, {variables: {query: "[{}]"}});
    console.log(data);

  if (!data) {
    if (error) {
      return (
        <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: "30px" }}>
          <Title txt={error} size={25} transform="uppercase" />
        </div>
      );
    } else if (loading) {
      return (
        <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: "30px" }}>
          <Title txt="Loading..." size={25} transform="uppercase" />
        </div>
      );
    }
  } else {
    return (
      <section className={styles.home}>
        <div className={styles.container}>
          <div className={styles.row}>
              <div className={styles.title}>
                <Title txt="all products" color="#171717" size={22} transform="uppercase" />
              </div>
          </div>
          <div className={styles.row}>
            {
              _.get(data, 'GoodFind').filter(({name}) => name).map((product, key) => <Card product={product} key={key} />)
            }
          </div>
        </div>
      </section>
    );
  }
};

export default Home;
