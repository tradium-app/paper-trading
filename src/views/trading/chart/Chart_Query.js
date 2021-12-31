import gql from 'graphql-tag';

const GET_NEW_GAME_QUERY = gql`
    query getNewGame {
        getNewGame {
            _id
            symbol
            timeStamp
            willPriceIncrease
            willPriceDecrease
            price_history {
                timeStamp
                close
                open
                high
                low
                volume
            }
            future_price_history {
                timeStamp
                close
                open
                high
                low
                volume
            }
        }
    }
`;

export default GET_NEW_GAME_QUERY;
