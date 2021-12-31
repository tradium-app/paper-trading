import { useSelector } from 'react-redux'
import { ApolloProvider } from '@apollo/client/react'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline, StyledEngineProvider } from '@mui/material'
import graphqlClient from './graphqlClient'
// routing
import Routes from 'routes'

// defaultTheme
import themes from 'themes'

// project imports
import NavigationScroll from 'layout/NavigationScroll'

// ==============================|| APP ||============================== //

const App = () => {
	const customization = useSelector((state) => state.customization)

	return (
		<StyledEngineProvider injectFirst>
			<ThemeProvider theme={themes(customization)}>
				<CssBaseline />
				<NavigationScroll>
					<ApolloProvider client={graphqlClient}>
						<Routes />
					</ApolloProvider>
				</NavigationScroll>
			</ThemeProvider>
		</StyledEngineProvider>
	)
}

export default App
