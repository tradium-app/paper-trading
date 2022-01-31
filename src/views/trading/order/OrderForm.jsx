import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme } from '@mui/material/styles'
import {
	Box,
	Button,
	FormControl,
	FormHelperText,
	Grid,
	InputLabel,
	OutlinedInput,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from '@mui/material'
import { Formik } from 'formik'
import * as Yup from 'yup'
import useScriptRef from 'hooks/useScriptRef'
import AnimateButton from 'ui-component/extended/AnimateButton'
import { EXECUTE_TRANSACTIONS } from 'store/actions'
import FormWrapper from './FormWrapper'
import PriceInput from './PriceInput'

export const OrderTypes = {
	Buy: 'Buy',
	Sell: 'Sell',
}

export const OrderCategories = {
	Market: 'Market',
	Stop: 'Stop',
}

export const OrderStatus = {
	Queued: 'Queued',
	Executed: 'Executed',
}

const OrderForm = ({ ...others }) => {
	const theme = useTheme()
	const scriptedRef = useScriptRef()
	const trading = useSelector((state) => state.trading)
	const dispatch = useDispatch()
	const [orderType, setOrderType] = useState(OrderTypes.Buy)
	const [orderCategory, setOrderCategory] = useState(OrderCategories.Market)

	const handleOrderTypeClick = (_, orderType) => {
		if (orderType != null) {
			setOrderType(orderType)
		}
	}

	const handleOrderCategoryClick = (_, orderCategory) => {
		if (orderCategory != null) {
			setOrderCategory(orderCategory)
		}
	}

	const handleOrder = (values, setErrors) => {
		if (orderType == OrderTypes.Buy && trading.cash < values.quantity * trading.candle.close) {
			setErrors({ submit: 'Not enough Cash balance.' })
			return
		}

		if (orderType == OrderTypes.Sell && trading.quantity < values.quantity) {
			setErrors({ submit: 'Not enough Stocks.' })
			return
		}

		const price = orderCategory == OrderCategories.Market ? trading.candle.close : values.price

		dispatch({
			type: EXECUTE_TRANSACTIONS,
			transactions: [
				{
					id: Date.now(),
					type: orderType,
					category: orderCategory,
					symbol: trading.symbol,
					quantity: values.quantity,
					price,
					amt: values.quantity * price,
					time: trading.time,
					status: OrderStatus.Queued,
				},
			],
		})
	}

	return (
		<FormWrapper>
			<Grid container spacing={2} justifyContent="center">
				<Grid item xs={12}>
					<Formik
						initialValues={{
							quantity: 10,
							submit: null,
							price: 0,
						}}
						validationSchema={Yup.object().shape({
							quantity: Yup.number().required('Quantity is required').positive().integer(),
						})}
						onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
							try {
								if (scriptedRef.current) {
									handleOrder(values, setErrors)
									setStatus({ success: true })
									setSubmitting(false)
								}
							} catch (err) {
								console.error(err)
								if (scriptedRef.current) {
									setStatus({ success: false })
									setErrors({ submit: err.message })
									setSubmitting(false)
								}
							}
						}}
					>
						{({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
							<form noValidate onSubmit={handleSubmit} {...others}>
								<ToggleButtonGroup fullWidth value={orderType} exclusive onChange={handleOrderTypeClick}>
									<ToggleButton value={OrderTypes.Buy} color="success">
										{OrderTypes.Buy}
									</ToggleButton>
									<ToggleButton value={OrderTypes.Sell} color="error">
										{OrderTypes.Sell}
									</ToggleButton>
								</ToggleButtonGroup>

								<ToggleButtonGroup value={orderCategory} onChange={handleOrderCategoryClick} fullWidth exclusive sx={{ mt: 2 }}>
									<ToggleButton value={OrderCategories.Market} color="success">
										{OrderCategories.Market}
									</ToggleButton>
									<ToggleButton value={OrderCategories.Stop} color="error">
										{OrderCategories.Stop}
									</ToggleButton>
								</ToggleButtonGroup>

								<FormControl
									error={Boolean(touched.quantity && errors.quantity)}
									sx={{ ...theme.typography.customInput, mt: 2 }}
									fullWidth
								>
									<InputLabel shrink>Quantity</InputLabel>
									<OutlinedInput
										type="number"
										value={values.quantity}
										name="quantity"
										onBlur={handleBlur}
										onChange={handleChange}
										label="Quantity"
										inputProps={{ step: '1' }}
										autoComplete="off"
									/>
									{touched.quantity && errors.quantity && <FormHelperText error>{errors.quantity}</FormHelperText>}
								</FormControl>

								<FormControl error={Boolean(touched.price && errors.price)} sx={{ ...theme.typography.customInput, mt: 1 }} fullWidth>
									<InputLabel shrink>Price</InputLabel>
									<PriceInput name="price" value={values.price} marketPrice={trading.candle.close} orderCategory={orderCategory} />
									{touched.price && errors.price && <FormHelperText error>{errors.price}</FormHelperText>}
								</FormControl>

								<Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mt: 2 }}>
									<Typography>
										{'Amt: '}
										{(values.quantity * values.price).toLocaleString(undefined, {
											maximumFractionDigits: 2,
										})}
									</Typography>
								</Stack>

								<Box sx={{ height: '1vw' }}>{errors.submit && <FormHelperText error>{errors.submit}</FormHelperText>}</Box>

								{orderType == OrderTypes.Buy && (
									<Box sx={{ mt: 2 }}>
										<AnimateButton>
											<Button
												disableElevation
												disabled={isSubmitting}
												fullWidth
												size="large"
												type="submit"
												variant="contained"
												color="success"
												onClick={() => setOrderType(OrderTypes.Buy)}
											>
												Buy
											</Button>
										</AnimateButton>
									</Box>
								)}
								{orderType == OrderTypes.Sell && (
									<Box sx={{ mt: 2 }}>
										<AnimateButton>
											<Button
												disableElevation
												disabled={isSubmitting}
												fullWidth
												size="large"
												type="submit"
												variant="contained"
												color="error"
												onClick={() => setOrderType(OrderTypes.Sell)}
											>
												Sell
											</Button>
										</AnimateButton>
									</Box>
								)}
							</form>
						)}
					</Formik>
				</Grid>
			</Grid>
		</FormWrapper>
	)
}

export default OrderForm
