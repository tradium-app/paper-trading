import React from 'react'
import { IconButton } from '@mui/material'
import { Visibility } from '@mui/icons-material'
import { useTheme } from '@mui/system'

const VisibilityBtn = ({ status, setStatus }) => {
	const theme = useTheme()

	const btnClickHandler = () => {
		setStatus(!status)
	}

	return (
		<IconButton
			aria-label="show/hide"
			onClick={btnClickHandler}
			sx={{ color: status ? theme.palette.text['primary'] : theme.palette.text['secondary'] }}
		>
			<Visibility />
		</IconButton>
	)
}

export default VisibilityBtn
