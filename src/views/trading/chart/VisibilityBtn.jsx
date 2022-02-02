import React from 'react'
import { IconButton } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useTheme } from '@mui/system'

const VisibilityBtn = ({ status, setStatus }) => {
	const theme = useTheme()

	const btnClickHandler = () => {
		setStatus(!status)
	}

	return (
		<IconButton aria-label="show/hide" onClick={btnClickHandler} sx={{ color: theme.palette.text['secondary'] }} size="small">
			{status && <Visibility />}
			{!status && <VisibilityOff />}
		</IconButton>
	)
}

export default VisibilityBtn
