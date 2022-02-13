import { OrderStatus, OrderTypes } from 'views/trading/order/OrderForm'

export const executeTransaction = (transaction, state) => {
	transaction.amt = transaction.quantity * transaction.price
	const newCash = transaction.type == OrderTypes.Buy ? state.cash - transaction.amt : state.cash + transaction.amt
	const newLockedCash = transaction.type == OrderTypes.Buy ? state.lockedCash - transaction.amt : state.lockedCash + transaction.amt
	const newQuantity = transaction.type == OrderTypes.Buy ? state.quantity + transaction.quantity : state.quantity - transaction.quantity
	const newLockedQuantity =
		transaction.type == OrderTypes.Buy ? state.lockedQuantity + transaction.quantity : state.lockedQuantity - transaction.quantity
	const newBalance = newCash + newQuantity * transaction.price
	transaction.cash = newCash
	transaction.status = OrderStatus.Executed

	return {
		...state,
		transactions: state.transactions.concat(transaction),
		cash: newCash,
		lockedCash: newLockedCash,
		quantity: newQuantity,
		lockedQuantity: newLockedQuantity,
		balance: newBalance,
	}
}

export const queueTransactions = (transactions, state) => {
	const newState = {
		...state,
		transactions: state.transactions.concat(transactions),
	}

	newState.lockedCash = newState.lockedCash + transactions.filter((t) => t.type == OrderTypes.Buy).reduce((acc, t) => acc + t.amt, 0)
	newState.lockedQuantity = newState.lockedQuantity + transactions.filter((t) => t.type == OrderTypes.Sell).reduce((acc, t) => acc + t.quantity, 0)

	return newState
}

export const cancelTransaction = (transactionId, state) => {
	const tran = state.transactions.find((transaction) => transaction.id == transactionId)

	const newState = {
		...state,
		transactions: state.transactions.filter((transaction) => transaction.id != transactionId),
	}

	if (tran.type == OrderTypes.Buy) {
		newState.lockedCash = newState.lockedCash - tran.amt
	} else {
		newState.lockedQuantity = newState.lockedQuantity - tran.quantity
	}

	return newState
}
