import { useTheme } from '@mui/material/styles'
import { Box, Button, FormControl, FormHelperText, InputLabel, OutlinedInput, Stack, Typography } from '@mui/material'
import * as Yup from 'yup'
import { Formik } from 'formik'
import useScriptRef from 'hooks/useScriptRef'
import AnimateButton from 'ui-component/extended/AnimateButton'
import { useDispatch, useSelector } from 'react-redux'

const OrderForm = ({ ...others }) => {
	const theme = useTheme()
	const scriptedRef = useScriptRef()
	const trading = useSelector((state) => state.trading)

	return (
		<>
			<Formik
				initialValues={{
					quantity: 10,
					submit: null,
				}}
				validationSchema={Yup.object().shape({
					email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
					password: Yup.string().max(255).required('Password is required'),
				})}
				onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
					try {
						if (scriptedRef.current) {
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
						<FormControl fullWidth error={Boolean(touched.quantity && errors.quantity)} sx={{ ...theme.typography.customInput }}>
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
								>
									Buy
								</Button>
							</AnimateButton>
						</Box>
						<Box sx={{ mt: 1 }}>
							<AnimateButton>
								<Button
									disableElevation
									disabled={isSubmitting}
									fullWidth
									size="large"
									type="submit"
									variant="contained"
									color="error"
								>
									Sell
								</Button>
							</AnimateButton>
						</Box>
					</form>
				)}
			</Formik>
		</>
	)
}

export default OrderForm
