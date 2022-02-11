import { useDispatch, useSelector } from 'react-redux'
import { IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import Paper from '@mui/material/Paper'
import { HighlightOffTwoTone, DoneAll } from '@mui/icons-material'
import MainCard from 'ui-component/cards/MainCard'
import { OrderStatus } from '../order/OrderForm'
import { CANCEL_TRANSACTION } from 'store/actions'

const OrderHistory = () => {
	const trading = useSelector((state) => state.trading)
	const dispatch = useDispatch()

	const cancelOrder = (transactionId) => {
		dispatch({
			type: CANCEL_TRANSACTION,
			transactionId,
		})
	}

	return (
		<MainCard sx={{ marginTop: 2 }}>
			<Stack alignItems="center" justifyContent="center">
				<Typography gutterBottom variant={'h4'}>
					Order History
				</Typography>
			</Stack>
			<TableContainer component={Paper}>
				<Table aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell>Type</TableCell>
							<TableCell align="right">Qty</TableCell>
							<TableCell align="right">Price</TableCell>
							<TableCell align="right"></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{trading?.transactions
							.sort((a, b) => b.id - a.id)
							.map((transaction, index) => (
								<TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
									<TableCell component="th" scope="row">
										<Typography fontSize="small">{transaction.type}</Typography>
									</TableCell>
									<TableCell align="right">
										<Typography fontSize="small">{transaction.quantity}</Typography>
									</TableCell>
									<TableCell align="right">
										<Typography fontSize="small">
											{transaction.price.toLocaleString(undefined, {
												maximumFractionDigits: 2,
											})}
										</Typography>
									</TableCell>
									<TableCell align="right">
										<IconButton
											disabled={transaction.status === OrderStatus.Executed}
											onClick={() => cancelOrder(transaction.id)}
										>
											{transaction.status === OrderStatus.Queued && <HighlightOffTwoTone fontSize="small" color="primary" />}
											{transaction.status === OrderStatus.Executed && <DoneAll fontSize="small" color="disabled" />}
										</IconButton>
									</TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>
			</TableContainer>
		</MainCard>
	)
}

export default OrderHistory
