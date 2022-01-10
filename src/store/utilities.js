import { OrderStatus } from 'views/trading/order/OrderForm'

export const executeTransaction = (transaction, state) => {
	transaction.amt = transaction.quantity * transaction.price
	const newCash = transaction.type == 'Buy' ? state.cash - transaction.amt : state.cash + transaction.amt
	const newQuantity = transaction.type == 'Buy' ? state.quantity + transaction.quantity : state.quantity - transaction.quantity
	const newBalance = newCash + newQuantity * transaction.price
	transaction.cash = newCash
	transaction.status = OrderStatus.Executed

	return {
		...state,
		transactions: state.transactions.concat(transaction),
		cash: newCash,
		quantity: newQuantity,
		balance: newBalance,
	}
}
