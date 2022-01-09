import { useSelector } from 'react-redux'
import { Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import Paper from '@mui/material/Paper'

const OrderHistory = () => {
	const trading = useSelector((state) => state.trading)

	return (
		<>
			<Stack alignItems="center" justifyContent="center" spacing={1}>
				<Typography gutterBottom variant={'h4'}>
					Order History
				</Typography>
			</Stack>
			<TableContainer component={Paper}>
				<Table aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell>Type</TableCell>
							<TableCell align="right">Quantity</TableCell>
							<TableCell align="right">Amt</TableCell>
							<TableCell align="right">Cash</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{trading?.transactions
							.sort((a, b) => b.id - a.id)
							.map((transaction, index) => (
								<TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
									<TableCell component="th" scope="row">
										{transaction.type}
									</TableCell>
									<TableCell align="right">{transaction.quantity}</TableCell>
									<TableCell align="right">
										{transaction.amt.toLocaleString(undefined, {
											maximumFractionDigits: 2,
										})}
									</TableCell>
									<TableCell align="right">
										{transaction.cash?.toLocaleString(undefined, {
											maximumFractionDigits: 2,
										})}
									</TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>
			</TableContainer>
		</>
	)
}

export default OrderHistory
