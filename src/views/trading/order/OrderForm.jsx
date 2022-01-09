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
import * as Yup from 'yup'
import { Formik } from 'formik'
import useScriptRef from 'hooks/useScriptRef'
import AnimateButton from 'ui-component/extended/AnimateButton'
import { EXECUTE_TRANSACTIONS } from 'store/actions'
import FormWrapper from './FormWrapper'

export const OrderTypes = {
	Buy: 'Buy',
	Sell: 'Sell',
}

export const OrderCategories = {
	Market: 'Market',
	Limit: 'Limit',
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
		if (orderType == OrderTypes.Buy && trading.cash < values.quantity * trading.price) {
			setErrors({ submit: 'Not enough Cash balance.' })
			return
		}

		if (orderType == OrderTypes.Sell && trading.quantity < values.quantity) {
			setErrors({ submit: 'Not enough Stocks.' })
			return
		}

		dispatch({
			type: EXECUTE_TRANSACTIONS,
			transactions: [
				{
					id: Date.now(),
					type: orderType,
					category: orderCategory,
					symbol: trading.symbol,
					quantity: values.quantity,
					price: trading.price,
					amt: values.quantity * trading.price,
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

								<ToggleButtonGroup fullWidth value={orderCategory} exclusive onChange={handleOrderCategoryClick} sx={{ mt: 2 }}>
									<ToggleButton value={OrderCategories.Market} color="success">
										{OrderCategories.Market}
									</ToggleButton>
									<ToggleButton value={OrderCategories.Limit} color="error">
										{OrderCategories.Limit}
									</ToggleButton>
								</ToggleButtonGroup>

								<FormControl
									fullWidth
									error={Boolean(touched.quantity && errors.quantity)}
									sx={{ ...theme.typography.customInput, mt: 2 }}
								>
									<InputLabel shrink>Quantity</InputLabel>
									<OutlinedInput
										id="lbl-quantity"
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

								<FormControl fullWidth error={Boolean(touched.price && errors.price)} sx={{ ...theme.typography.customInput, mt: 1 }}>
									<InputLabel shrink>Price</InputLabel>
									<OutlinedInput
										name="price"
										type="number"
										value={(orderCategory == OrderCategories.Market && trading.price) || values.price}
										onBlur={handleBlur}
										onChange={handleChange}
										disabled={orderCategory == OrderCategories.Market}
										autoComplete="off"
									/>
									{touched.price && errors.price && <FormHelperText error>{errors.price}</FormHelperText>}
								</FormControl>

								<Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mt: 2 }}>
									<Typography>
										{'Amt: '}
										{(values.quantity * trading.price).toLocaleString(undefined, {
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
