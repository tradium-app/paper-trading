import * as actionTypes from './actions'

export const initialState = {
	price: 0,
	quantity: 0,
	cash: 10000,
	balance: 10000,
	transaction: null,
}

const tradingReducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.SET_PRICE:
			return {
				...state,
				balance: state.cash + state.quantity * action.price,
				price: action.price,
			}
		case actionTypes.EXECUTE_TRANSACTION:
			const transaction = action.transaction
			const amt = transaction.quantity * transaction.price
			const newCash = transaction.type == 'Buy' ? state.cash - amt : state.cash + amt
			const newQuantity = transaction.type == 'Buy' ? state.quantity + transaction.quantity : state.quantity - transaction.quantity
			const newBalance = newCash + newQuantity * transaction.price

			return {
				...state,
				transaction,
				cash: newCash,
				quantity: newQuantity,
				balance: newBalance,
			}
		default:
			return state
	}
}

export default tradingReducer
