import Title from "components/Title";
import { useParams } from "react-router-dom";
import styles from "styles/Detail.module.scss";
import { useQuery } from "@apollo/client";
import { GOOD_FIND_ONE } from "apollo/queries";
import _ from 'lodash';
import {IMAGES_URL} from '../config';

const Detail = () => {
  const {_id} = useParams();

  const {data} = useQuery(GOOD_FIND_ONE, {variables: {query: `[{"_id" : "${_id}"}]`}});
  const product = _.get(data,'GoodFindOne', null);

  return (
    <section className={styles.detail}>
      {!product ? (
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <Title txt="Loading..." size={25} transform="uppercase" />
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.top}>
              { !_.isEmpty(product.images) ?
                <div className={styles.img}>
                  <img src={IMAGES_URL + product.images[0].url } alt="" />
                </div>
              : null}
            <div className={styles.info}>
              <div className={styles.title}>
                <Title txt={product.name} transform="uppercase" size={20} />
              </div>
                {product.price ?
                  (<div className={styles.price}>
                    <p>
                      {product.price.toFixed(2)} <small>UAH</small>
                    </p>
                  </div>)
                : null }
            </div>
          </div>
          <div className={styles.bottom}>
            <Title txt="Description" size={20} transform="capitalize" />
            <p className={styles.desc}>{product.description}</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default Detail;
