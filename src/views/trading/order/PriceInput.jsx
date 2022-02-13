import { useField } from 'formik'
import { useEffect } from 'react'
import { OutlinedInput } from '@mui/material'

const PriceInput = ({ name, initialValue, onBlur }) => {
	const [field, meta, helpers] = useField({ name, value: initialValue })
	const { setValue, setTouched } = helpers

	useEffect(() => {
		setValue(initialValue)
	}, [initialValue])

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
