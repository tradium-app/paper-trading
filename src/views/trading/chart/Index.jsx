import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useQuery } from '@apollo/client'
import { createChart } from 'lightweight-charts'
import GET_NEW_GAME_QUERY from './Chart_Query'
import computeChartData from './computeChartData'
import { useLocalStorage } from 'beautiful-react-hooks'
import { emaPeriod, defaultChartOptions, afterPredictionChartOptions, candleSeriesOptions, volumeSeriesOptions, emaSeriesOptions } from './configs'
import { Box, Fab } from '@mui/material'
import PlayArrow from '@mui/icons-material/PlayArrow'
import Pause from '@mui/icons-material/Pause'
import { SET_PRICE } from 'store/actions'

const Chart = () => {
	const containerId = useRef(null)
	const [candleSeries, setCandleSeries] = useState(null)
	const [volumeSeries, setVolumeSeries] = useState(null)
	const [emaSeries, setEmaSeries] = useState(null)
	const [showEma26] = useLocalStorage('showEma26', 1)
	const [showRSI] = useLocalStorage('showRSI', 1)
	const dispatch = useDispatch()
	const trading = useSelector((state) => state.trading)
	const [currentIndex, setCurrentIndex] = useState(0)

	const { loading, error, data, refetch } = useQuery(GET_NEW_GAME_QUERY, {
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	})

	useEffect(() => {
		containerId.current = createChart(containerId.current, {
			width: containerId.current.offsetWidth,
			height: 700,
		})
		setCandleSeries(containerId.current.addCandlestickSeries(candleSeriesOptions))
		setVolumeSeries(containerId.current.addHistogramSeries(volumeSeriesOptions))
		setEmaSeries(containerId.current.addLineSeries(emaSeriesOptions))

		containerId.current.timeScale().applyOptions({ rightOffset: 15 })

		let stockUpdater = setInterval(() => {
			setCurrentIndex((prevIndex) => prevIndex + 1)
		}, 5000)

		if (stockUpdater) return () => clearInterval(stockUpdater)
	}, [])

	let priceData, volumeData, emaData, predictionPoint

	if (!loading && !error && data.getNewGame) {
		;({ priceData, volumeData, emaData } = computeChartData(data.getNewGame, showEma26, showRSI))
		predictionPoint = priceData[data.getNewGame.price_history.length].time
	}

	useEffect(() => {
		if (!loading && !error && priceData) {
			candleSeries.setData(priceData.slice(0, data.getNewGame.price_history.length))
			volumeSeries.setData(volumeData.slice(0, data.getNewGame.price_history.length))
			showEma26 && emaSeries.setData(emaData.filter((ed) => ed.time <= predictionPoint))
		}
	}, [loading])

	useEffect(() => {
		const index = data?.getNewGame?.price_history?.length
		currentIndex == 0 && index > 0 && setCurrentIndex(index)
	}, [data?.getNewGame?.price_history?.length])

	useEffect(() => {
		if (!loading && !error && priceData && currentIndex > 0) {
			dispatch({ type: SET_PRICE, price: priceData[currentIndex].close })

			candleSeries.update(priceData[currentIndex])
			volumeSeries.update(volumeData[currentIndex])
			showEma26 && emaSeries.update(emaData[currentIndex - emaPeriod])
		}
	}, [currentIndex])

	return (
		<Box sx={{ transform: 'translateZ(0px)', flexGrow: 1 }}>
			<div ref={containerId} slot="test" />
			<Box sx={{ '& > :not(style)': { m: 1 }, position: 'absolute', top: 8, right: 16, zIndex: 99 }}>
				<Fab color="primary" aria-label="add" spot="testing">
					<Pause />
				</Fab>
				<Fab variant="extended" aria-label="edit">
					{'Balance: '}
					{trading.balance.toLocaleString(undefined, {
						maximumFractionDigits: 0,
					})}
				</Fab>
			</Box>
		</Box>
	)
}

export default Chart
