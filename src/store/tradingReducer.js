import * as actionTypes from './actions'

export const initialState = {
	price: 0,
	quantity: 0,
	balance: 10000,
	transaction: null,
}

const tradingReducer = (state = initialState, action) => {
	console.log('printing action', action)

	switch (action.type) {
		case actionTypes.SET_PRICE:
			return {
				...state,
				price: action.price,
			}
		case actionTypes.EXECUTE_TRANSACTION:
			const transaction = action.transaction
			const newBalance = transaction.type == 'Buy' ? state.balance - transaction.amt : state.balance + transaction.amt
			const newQuantity = transaction.type == 'Buy' ? state.quantity - transaction.quantity : state.balance + transaction.quantity

			return {
				...state,
				transaction,
				quantity: newQuantity,
				balance: newBalance,
			}
		default:
			return state
	}
}

export default tradingReducer
