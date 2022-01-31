import * as actionTypes from './actions'
import { OrderCategories, OrderStatus } from 'views/trading/order/OrderForm'
import { executeTransaction } from './utilities'

export const initialState = {
	symbol: null,
	candle: { open: 0, high: 0, low: 0, close: 0 },
	time: null,
	quantity: 0,
	cash: 10000,
	balance: 10000,
	transactions: [],
}

const tradingReducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.SET_PRICE: {
			let newState = state
			const candle = action.candle
			state.transactions
				.filter((t) => t.status == OrderStatus.Queued)
				.forEach((transaction) => {
					let newTransaction
					if (
						inBetween(transaction.price, state.candle.low, candle.high) ||
						inBetween(transaction.price, state.candle.high, candle.low) ||
						inBetween(transaction.price, candle.high, candle.low)
					) {
						const newPrice = inBetween(transaction.price, candle.high, candle.low) ? transaction.price : candle.open
						newTransaction = { ...transaction, time: action.time, price: newPrice }
					}

					if (newTransaction) {
						const stateWithoutCurrentTransaction = {
							...state,
							transactions: newState.transactions.filter((t) => t.id != transaction.id),
						}
						newState = executeTransaction(newTransaction, stateWithoutCurrentTransaction)
					}
				})

			return {
				...newState,
				symbol: action.symbol,
				time: action.time,
				candle,
				balance: state.cash + state.quantity * action.candle.close,
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

const inBetween = (num, num1, num2) => {
	return num >= Math.min(num1, num2) && num <= Math.max(num1, num2)
}

export default tradingReducer
