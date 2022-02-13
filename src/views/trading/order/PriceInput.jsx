import { useField } from 'formik'
import { useEffect } from 'react'
import { OutlinedInput } from '@mui/material'

const PriceInput = ({ name, value, onBlur }) => {
	const [field, meta, helpers] = useField({ name, value })
	const { setValue, setTouched } = helpers

	useEffect(() => {
		setValue(value)
	}, [value])

	return (
		<OutlinedInput
			name="price"
			type="number"
			value={field.value}
			onChange={(event) => {
				setTouched(true)
				setValue(event.target.value)
				event.preventDefault()
			}}
			onBlur={onBlur}
			autoComplete="off"
		/>
	)
}

export default PriceInput
