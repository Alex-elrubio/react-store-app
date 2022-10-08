import { gql } from '@apollo/client';

export const CATEGORY_FIND = gql`
  query CategoryFind($query: String) {
  CategoryFind(query:$query) {
    _id
    name
    image {
      url
    }
  }
}
`;

export const GOOD_FIND = gql`
query GoodFind($query: String) {
  GoodFind(query:$query) {
    _id
    name
    images{url}
    price
  }
}  
`;

export const GOOD_FIND_ONE = gql`
query GoodFindOne($query: String) {
  GoodFindOne(query:$query) {
    _id
    name
    images{url}
    price
    description
	}
}
`;
