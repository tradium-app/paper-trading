import * as actionTypes from './actions'

export const initialState = {
	price: 0,
}

const tradingReducer = (state = initialState, action) => {
	let price
	console.log('printing action', action)
	switch (action.type) {
		case actionTypes.SET_PRICE:
			price = action.price
			return {
				...state,
				price: price,
			}
		default:
			return state
	}
}

export default tradingReducer
