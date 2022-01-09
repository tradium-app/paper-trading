import { Grid } from '@mui/material'

import BackgroundWrapper from './BackgroundWrapper'
import OrderForm from './order/OrderForm'
import Chart from './chart/Index'
import MainCard from 'ui-component/cards/MainCard'
import OrderHistory from './orderHistory/Index'

const Login = () => {
	return (
		<BackgroundWrapper>
			<Grid container direction="column" justifyContent="flex-end" sx={{ minHeight: '100vh', padding: 2 }}>
				<Grid container sx={{ minHeight: 'calc(100vh - 68px)' }}>
					<Grid item lg={9} mb={9} xs={12}>
						<MainCard>
							<Chart />
						</MainCard>
					</Grid>
					<Grid item lg={3} mb={3} xs={12} sx={{ paddingLeft: 2 }}>
						<OrderForm />
						<OrderHistory />
					</Grid>
				</Grid>
			</Grid>
		</BackgroundWrapper>
	)
}

export default Login
