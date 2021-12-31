import { Outlet } from 'react-router-dom'
import Customization from '../Customization'

const MinimalLayout = () => (
	<>
		<Outlet />
		<Customization />
	</>
)

export default MinimalLayout
