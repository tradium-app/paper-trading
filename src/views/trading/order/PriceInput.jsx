import { useField } from 'formik'
import { useEffect } from 'react'
import { OrderCategories } from './OrderForm'
import { OutlinedInput } from '@mui/material'

const PriceInput = ({ name, value, orderCategory, marketPrice }) => {
	const [field, meta, helpers] = useField({ name, value })
	const { setValue, setTouched } = helpers

	useEffect(() => {
		if (orderCategory == OrderCategories.Market) {
			setValue(marketPrice)
		}
	}, [marketPrice, orderCategory])

	return (
		<OutlinedInput
			name="price"
			type="number"
			value={value}
			onChange={(event) => {
				setTouched(true)
				setValue(event.target.value)
				event.preventDefault()
			}}
			disabled={orderCategory == OrderCategories.Market}
			autoComplete="off"
		/>
	)
}

export default PriceInput
