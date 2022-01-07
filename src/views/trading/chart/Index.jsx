import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useQuery } from '@apollo/client'
import { createChart, LineStyle } from 'lightweight-charts'
import GET_NEW_GAME_QUERY from './Chart_Query'
import computeChartData from './computeChartData'
import { useLocalStorage } from 'beautiful-react-hooks'
import { emaPeriod, defaultChartOptions, candleSeriesOptions, volumeSeriesOptions, emaSeriesOptions, markerOptions } from './configs'
import { Box, Fab } from '@mui/material'
import PlayPauseBtn from './PlayPauseBtn'
import Forward from '@mui/icons-material/Forward'
import PlaylistRemoveOutlinedIcon from '@mui/icons-material/PlaylistRemoveOutlined'
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
	const [pricelines, setPricelines] = useState([])

	const { loading, error, data, refetch } = useQuery(GET_NEW_GAME_QUERY, {
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	})

	useEffect(() => {
		containerId.current = createChart(containerId.current, {
			width: containerId.current.offsetWidth,
			height: 700,
		})

		let candleSeries = containerId.current.addCandlestickSeries(candleSeriesOptions)
		setCandleSeries(candleSeries)
		setVolumeSeries(containerId.current.addHistogramSeries(volumeSeriesOptions))
		setEmaSeries(containerId.current.addLineSeries(emaSeriesOptions))

		containerId.current.subscribeClick((param) => {
			const clickedPrice = candleSeries.coordinateToPrice(param.point.y)
			let priceLine = {
				price: clickedPrice,
				color: '#be1238',
				lineStyle: LineStyle.Solid,
			}
			priceLine = candleSeries.createPriceLine(priceLine)
			setPricelines((ps) => ps.concat(priceLine))
		})

		containerId.current.applyOptions(defaultChartOptions)
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
			dispatch({ type: SET_PRICE, symbol: data.getNewGame.symbol, price: priceData[currentIndex].close, time: priceData[currentIndex].time })

			candleSeries.update(priceData[currentIndex])
			volumeSeries.update(volumeData[currentIndex])
			showEma26 && emaSeries.update(emaData[currentIndex - emaPeriod])
		}

		if (!loading && priceData && currentIndex > priceData.length - 1) {
			setPlayStatus(PlayStatus.done)
		}
	}, [currentIndex])

	useEffect(() => {
		candleSeries?.setMarkers([])
		if (priceData && currentIndex > 0) {
			let markers = []

			trading?.transactions
				.filter((transaction) => transaction.symbol == data.getNewGame.symbol)
				.filter(
					(transaction) =>
						new Date(transaction.time) >= new Date(priceData[0].time) &&
						new Date(transaction.time) <= new Date(priceData[Math.min(currentIndex, priceData.length - 1)].time),
				)
				.forEach((transaction) => {
					markers.push({
						...markerOptions,
						color: transaction.type == 'Buy' ? 'blue' : 'black',
						text: transaction.type,
						time: transaction.time,
					})
				})
			if (markers.length > 0) candleSeries.setMarkers(markers)
		}
	}, [trading?.transactions, loading])

	const removePriceLines = () => {
		pricelines.forEach((ps) => {
			candleSeries.removePriceLine(ps)
		})
	}

	return (
		<Box sx={{ transform: 'translateZ(0px)', flexGrow: 1 }}>
			<div ref={containerId} slot="test" />
			<Box sx={{ '& > :not(style)': { m: 1 }, position: 'absolute', top: 8, right: 16, zIndex: 99 }}>
				<PlayPauseBtn playStatus={playStatus} setPlayStatus={setPlayStatus} />
				<Fab title="Move one step forward" color="primary" onClick={() => setCurrentIndex((prevIndex) => prevIndex + 1)}>
					<Forward />
				</Fab>
				<Fab title="Remove All Pricelines" color="primary" onClick={removePriceLines}>
					<PlaylistRemoveOutlinedIcon />
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
