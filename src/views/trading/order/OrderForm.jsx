import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme } from '@mui/material/styles'
import {
	Box,
	Button,
	Checkbox,
	FormControl,
	FormControlLabel,
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

	const handleOrderTypeClick = (_, orderType) => {
		if (orderType != null) {
			setOrderType(orderType)
		}
	}

	const handleOrder = (values, setErrors, setStatus) => {
		if (orderType == OrderTypes.Buy && trading.cash - trading.lockedCash < values.quantity * trading.candle.close) {
			setErrors({ submit: 'Not enough Cash balance.' })
			return
		}

		if (orderType == OrderTypes.Sell && trading.quantity - trading.lockedQuantity < values.quantity) {
			setErrors({ submit: 'Not enough Stocks.' })
			return
		}

		const transaction = {
			id: Date.now(),
			type: orderType,
			category: OrderCategories.Stop,
			symbol: trading.symbol,
			quantity: values.quantity,
			price: values.price,
			amt: values.quantity * values.price,
			time: trading.time,
			status: OrderStatus.Queued,
		}

		const stopLessTransaction = values.isStopLossEnabled && {
			...transaction,
			id: transaction.id + 1,
			type: orderType == OrderTypes.Buy ? OrderTypes.Sell : OrderTypes.Buy,
			price: values.stopLossPrice,
			amt: values.quantity * values.stopLossPrice,
		}

		const transactions = stopLessTransaction ? [transaction, stopLessTransaction] : [transaction]

		dispatch({
			type: EXECUTE_TRANSACTIONS,
			transactions,
		})

		setStatus('success')
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
							stopLossPrice: 0,
							isStopLossEnabled: true,
						}}
						validationSchema={Yup.object().shape({
							quantity: Yup.number().required('Quantity is required').positive().integer(),
						})}
						onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
							setStatus('')
							try {
								if (scriptedRef.current) {
									handleOrder(values, setErrors, setStatus)
									setSubmitting(false)
								}
							} catch (err) {
								console.error(err)
								if (scriptedRef.current) {
									setStatus('fail')
									setErrors({ submit: err.message })
									setSubmitting(false)
								}
							}
						}}
					>
						{({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, status }) => (
							<form noValidate onSubmit={handleSubmit} {...others}>
								<ToggleButtonGroup fullWidth value={orderType} exclusive onChange={handleOrderTypeClick}>
									<ToggleButton value={OrderTypes.Buy} color="success">
										{OrderTypes.Buy}
									</ToggleButton>
									<ToggleButton value={OrderTypes.Sell} color="error">
										{OrderTypes.Sell}
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
									<PriceInput
										name="price"
										value={values.price != 0 ? values.price : trading.candle.close}
										onBlur={handleBlur}
										autoComplete="off"
									/>
									{touched.price && errors.price && <FormHelperText error>{errors.price}</FormHelperText>}
								</FormControl>

								<FormControl error={Boolean(touched.price && errors.price)} sx={{ ...theme.typography.customInput, mt: 1 }} fullWidth>
									<FormControlLabel
										name="isStopLossEnabled"
										label="Stop Loss Price"
										control={<Checkbox checked={values.isStopLossEnabled} />}
										onChange={handleChange}
										autoComplete="off"
									/>
									{values.isStopLossEnabled && (
										<PriceInput
											name="stopLossPrice"
											value={values.stopLossPrice != 0 ? values.stopLossPrice : trading.candle.close}
											onBlur={handleBlur}
											autoComplete="off"
										/>
									)}
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

								<Box sx={{ height: '1vw' }}>
									{errors.submit && <FormHelperText error>{errors.submit}</FormHelperText>}
									{status == 'success' && (
										<FormHelperText sx={{ color: theme.palette.success.dark }}>{'Order queued successfully.'}</FormHelperText>
									)}
								</Box>

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
