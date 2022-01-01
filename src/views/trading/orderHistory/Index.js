import { Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import Paper from '@mui/material/Paper'

const OrderHistory = () => {
	const rows = [
		{ id: '1', type: 'Buy', quantity: 1, amount: 1000, balance: 2000 },
		{ id: '2', type: 'Sell', quantity: 1, amount: 1000, balance: 2000 },
	]

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
							<TableCell align="right">Amount</TableCell>
							<TableCell align="right">Balance</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{rows.map((row) => (
							<TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
								<TableCell component="th" scope="row">
									{row.type}
								</TableCell>
								<TableCell align="right">{row.quantity}</TableCell>
								<TableCell align="right">{row.amount}</TableCell>
								<TableCell align="right">{row.balance}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</>
	)
}

export default OrderHistory
