import { combineReducers } from 'redux'
import tradingReducer from './tradingReducer'

const reducer = combineReducers({
	trading: tradingReducer,
})

export default reducer
