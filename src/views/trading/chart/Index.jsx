import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useQuery } from '@apollo/client'
import { createChart } from 'lightweight-charts'
import GET_NEW_GAME_QUERY from './Chart_Query'
import computeChartData from './computeChartData'
import { useLocalStorage } from 'beautiful-react-hooks'
import { emaPeriod, defaultChartOptions, afterPredictionChartOptions, candleSeriesOptions, volumeSeriesOptions, emaSeriesOptions } from './configs'
import { Box, Fab } from '@mui/material'
import PlayPauseBtn from './PlayPauseBtn'
import { SET_PRICE, CLOSE_ALL_ORDERS } from 'store/actions'

export const PlayStatus = {
	playing: 'playing',
	paused: 'paused',
	done: 'done',
	resetting: 'resetting',
}

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
	const [playStatus, setPlayStatus] = useState(PlayStatus.playing)

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
	}, [])

	useEffect(() => {
		let stockUpdater
		if (playStatus == PlayStatus.playing) {
			stockUpdater = setInterval(() => {
				setCurrentIndex((prevIndex) => prevIndex + 1)
			}, 5000)
		} else if (playStatus == PlayStatus.resetting) {
			refetch()
			dispatch({ type: CLOSE_ALL_ORDERS })
			setPlayStatus(PlayStatus.playing)
		}

		if (stockUpdater) return () => clearInterval(stockUpdater)
	}, [playStatus])

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

			setCurrentIndex(data?.getNewGame?.price_history?.length)
		}
	}, [loading])

	useEffect(() => {
		if (!loading && !error && priceData && currentIndex > 0 && currentIndex < priceData.length) {
			dispatch({ type: SET_PRICE, price: priceData[currentIndex].close })

			candleSeries.update(priceData[currentIndex])
			volumeSeries.update(volumeData[currentIndex])
			showEma26 && emaSeries.update(emaData[currentIndex - emaPeriod])
		}

		if (!loading && priceData && currentIndex > priceData.length - 1) {
			setPlayStatus(PlayStatus.done)
		}
	}, [currentIndex])

	return (
		<Box sx={{ transform: 'translateZ(0px)', flexGrow: 1 }}>
			<div ref={containerId} slot="test" />
			<Box sx={{ '& > :not(style)': { m: 1 }, position: 'absolute', top: 8, right: 16, zIndex: 99 }}>
				<PlayPauseBtn playStatus={playStatus} setPlayStatus={setPlayStatus} />
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
