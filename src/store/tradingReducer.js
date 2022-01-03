import * as actionTypes from './actions'

export const initialState = {
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
				time: action.time,
				balance: state.cash + state.quantity * action.price,
				price: action.price,
			}
		}
		case actionTypes.EXECUTE_TRANSACTION: {
			const transaction = action.transaction
			transaction.amt = transaction.quantity * transaction.price
			const newCash = transaction.type == 'Buy' ? state.cash - transaction.amt : state.cash + transaction.amt
			const newQuantity = transaction.type == 'Buy' ? state.quantity + transaction.quantity : state.quantity - transaction.quantity
			const newBalance = newCash + newQuantity * transaction.price
			transaction.cash = newCash
			transaction.order = state.transactions.length + 1

			return {
				...state,
				transactions: state.transactions.concat(transaction),
				cash: newCash,
				quantity: newQuantity,
				balance: newBalance,
			}
		}
		case actionTypes.CLOSE_ALL_ORDERS: {
			if (state.quantity <= 0) {
				return state
			}
			const transaction = {
				type: 'Sell',
				quantity: state.quantity,
				price: state.price,
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
