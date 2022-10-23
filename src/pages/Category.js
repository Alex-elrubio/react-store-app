import styles from "styles/Category.module.scss";
import Card from "components/Card";
import Title from "components/Title";
import useMakeRequest from "hooks/useMakeRequest";
import { useParams } from "react-router-dom";
import _ from 'lodash';
import { CATEGORY_FIND_ONE, GOOD_FIND_ONE } from "apollo/queries";
import { useQuery } from "@apollo/client";

const Category = () => {
  const { _id } = useParams();
  const {data, loading, error} = useQuery(CATEGORY_FIND_ONE, {variables: {query: `[{\"_id\" : \"${_id}\"}]`}});

  const category = _.get(data,'CategoryFindOne', null);
  const product = _.get(category,'goods', null);
  const categoryName = _.get(category,'name', null);


  if (!product) {
    return (
      <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: "30px" }}>
        <Title txt="Loading..." size={25} transform="uppercase" />
      </div>
    );
  } else {
    return (
      <section className={styles.category}>
        <div className={styles.container}>
          <div className={styles.row}>
            {product && (
              <div className={styles.title}>
                <Title txt={categoryName} color="#171717" size={22} transform="uppercase" />  
              </div>
            )}
          </div>
          <div className={styles.row}>
            {product ? (
              product.map((product, key) => <Card product={product} key={key} />)
            ) : (
              <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <Title txt={product.error} size={25} transform="uppercase" />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
};

export default Category;


//62c94b10b74e1f5f2ec1a0dd вытащить с помощьб квери эту категорию +
//вывести в консоль.лог полученые данные+
//поменять в роутере слаг на ИД, +
//получить на стр категори из параметров роутинга+
//Использовать это ИД в квери и убедиться что приходят разные+
//вывести имя категории из полученых данных выв. товары из полученых данных так как делается на Хомепайдж
// _.get(data, 'GoodFind').filter(({name}) => name).map((product, key) => <Card product={product} key={key} />)


// хеш использывать квери парпметр квери в консоль лог использывать дату

// => <Card product={product} key={key} />

//вывести название категории (имя)
// 