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
import { EXECUTE_TRANSACTION } from 'store/actions'
import FormWrapper from './FormWrapper'

const OrderTypes = {
	Buy: 'Buy',
	Sell: 'Sell',
}

const OrderCategories = {
	Market: 'Market',
	Limit: 'Limit',
}

const OrderForm = ({ ...others }) => {
	const theme = useTheme()
	const scriptedRef = useScriptRef()
	const trading = useSelector((state) => state.trading)
	const dispatch = useDispatch()
	const [orderType, setOrderType] = useState(OrderTypes.Buy)
	const [orderCategory, setOrderCategory] = useState(OrderCategories.Market)

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
			type: EXECUTE_TRANSACTION,
			transaction: { type: orderType, symbol: trading.symbol, quantity: values.quantity, price: trading.price, time: trading.time },
		})
	}

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
									<InputLabel htmlFor="outlined-adornment-quantity">Quantity</InputLabel>
									<OutlinedInput
										id="outlined-adornment-quantity"
										type="number"
										value={values.quantity}
										name="quantity"
										onBlur={handleBlur}
										onChange={handleChange}
										label="Quantity"
										inputProps={{ step: '1' }}
										autoComplete="off"
									/>
									{touched.quantity && errors.quantity && (
										<FormHelperText error id="standard-weight-helper-text-quantity">
											{errors.quantity}
										</FormHelperText>
									)}
								</FormControl>
								<Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
									<Typography>
										{'Price: '}
										{trading.price.toLocaleString(undefined, {
											maximumFractionDigits: 2,
										})}
									</Typography>
									<Typography>
										{'Amt: '}
										{(values.quantity * trading.price).toLocaleString(undefined, {
											maximumFractionDigits: 2,
										})}
									</Typography>
								</Stack>

								{errors.submit && (
									<Box sx={{ mt: 3 }}>
										<FormHelperText error>{errors.submit}</FormHelperText>
									</Box>
								)}

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
