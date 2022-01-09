import * as actionTypes from './actions'
import { OrderCategories, OrderStatus } from 'views/trading/order/OrderForm'
import { executeTransaction } from './utilities'

export const initialState = {
	symbol: null,
	price: 0,
	time: null,
	quantity: 0,
	cash: 10000,
	balance: 10000,
	transactions: [],
}

const tradingReducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.SET_PRICE: {
			return {
				...state,
				symbol: action.symbol,
				time: action.time,
				balance: state.cash + state.quantity * action.price,
				price: action.price,
			}
		}
		case actionTypes.EXECUTE_TRANSACTIONS: {
			const newState = {
				...state,
				transactions: state.transactions.concat(action.transactions),
			}
			const marketTransaction = action.transactions.find((t) => t.category == OrderCategories.Market && t.status == OrderStatus.Queued)

			if (marketTransaction) {
				const stateWithoutMarketTransaction = { ...state, transactions: newState.transactions.filter((t) => t.id != marketTransaction.id) }
				const stateWithAllTransactions = executeTransaction(marketTransaction, stateWithoutMarketTransaction)

				return stateWithAllTransactions
			} else {
				return newState
			}
		}
		case actionTypes.CLOSE_ALL_ORDERS: {
			if (state.quantity <= 0) {
				return state
			}
			const transaction = {
				type: 'Sell',
				symbol: state.symbol,
				quantity: state.quantity,
				price: state.price,
				time: state.time,
				amt: state.quantity * state.price,
				cash: state.balance,
				order: state.transactions.length + 1,
			}
			return {
				...state,
				transactions: state.transactions.concat(transaction),
				cash: state.balance,
				quantity: 0,
			}
		}
		default:
			return state
	}
}

export default tradingReducer
