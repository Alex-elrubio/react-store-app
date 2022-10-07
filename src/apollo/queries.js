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
