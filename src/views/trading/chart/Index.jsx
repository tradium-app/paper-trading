import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useQuery } from '@apollo/client'
import { createChart, LineStyle } from 'lightweight-charts'
import GET_NEW_GAME_QUERY from './Chart_Query'
import computeChartData from './computeChartData'
import { emaPeriod, defaultChartOptions, candleSeriesOptions, volumeSeriesOptions, emaSeriesOptions, markerOptions, bbPeriod } from './configs'
import { Box, Fab, Tooltip } from '@mui/material'
import PlayPauseBtn from './PlayPauseBtn'
import { PlaylistRemoveOutlined, Forward } from '@mui/icons-material'
import { SET_PRICE, CLOSE_ALL_ORDERS } from 'store/actions'
import { OrderStatus } from '../order/OrderForm'
import VisibilityBtn from './VisibilityBtn'

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
	const [emaHighSeries, setEmaHighSeries] = useState(null)
	const [bbUpperSeries, setBbUpperSeries] = useState(null)
	const [bbMiddleSeries, setBbMiddleSeries] = useState(null)
	const [bbLowerSeries, setBbLowerSeries] = useState(null)
	const dispatch = useDispatch()
	const trading = useSelector((state) => state.trading)
	const [currentIndex, setCurrentIndex] = useState(0)
	const [playStatus, setPlayStatus] = useState(PlayStatus.paused)
	const [pricelines, setPricelines] = useState([])
	const [showBB, setShowBB] = useState(true)

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
		setEmaHighSeries(containerId.current.addLineSeries({ ...emaSeriesOptions, color: 'rgba(235, 43, 75, 0.8)' }))
		setBbUpperSeries(containerId.current.addLineSeries(emaSeriesOptions))
		setBbMiddleSeries(containerId.current.addLineSeries(emaSeriesOptions))
		setBbLowerSeries(containerId.current.addLineSeries(emaSeriesOptions))

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
		if (bbUpperSeries) {
			if (showBB) {
				bbUpperSeries.applyOptions(emaSeriesOptions)
				bbMiddleSeries.applyOptions({ ...emaSeriesOptions, color: 'rgba(39, 165, 154, 0.9)' })
				bbLowerSeries.applyOptions(emaSeriesOptions)
			} else
				[bbUpperSeries, bbMiddleSeries, bbLowerSeries].forEach((s) =>
					s.applyOptions({
						color: 'rgba(0, 0, 255, 0.0)',
					}),
				)
		}
	}, [showBB, bbUpperSeries])

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

	let priceData, volumeData, emaData, bbData, predictionPoint

	if (!loading && !error && data.getNewGame) {
		;({ priceData, volumeData, emaData, bbData } = computeChartData(data.getNewGame, false))
		predictionPoint = priceData[data.getNewGame.price_history.length].time
	}

	useEffect(() => {
		if (!loading && !error && priceData) {
			candleSeries.setData(priceData.slice(0, data.getNewGame.price_history.length))
			volumeSeries.setData(volumeData.slice(0, data.getNewGame.price_history.length))
			emaHighSeries.setData(emaData.high.filter((ed) => ed.time <= predictionPoint))
			const filteredBB = bbData.filter((bb) => bb.time <= predictionPoint)
			const upperBB = filteredBB.map((bb) => {
				return { ...bb, value: bb.value.upper }
			})
			const middleBB = filteredBB.map((bb) => {
				return { ...bb, value: bb.value.middle }
			})
			const lowerBB = filteredBB.map((bb) => {
				return { ...bb, value: bb.value.lower }
			})

			bbUpperSeries.setData(upperBB)
			bbMiddleSeries.setData(middleBB)
			bbLowerSeries.setData(lowerBB)

			setCurrentIndex(data?.getNewGame?.price_history?.length)
		}
	}, [loading])

	useEffect(() => {
		if (!loading && !error && priceData && currentIndex > 0 && currentIndex < priceData.length) {
			dispatch({ type: SET_PRICE, symbol: data.getNewGame.symbol, candle: priceData[currentIndex], time: priceData[currentIndex].time })

			candleSeries.update(priceData[currentIndex])
			volumeSeries.update(volumeData[currentIndex])
			emaHighSeries.update(emaData.high[currentIndex - emaPeriod.high])

			const currentBB = bbData[currentIndex - bbPeriod]
			bbUpperSeries.update({ ...currentBB, value: currentBB.value.upper })
			bbMiddleSeries.update({ ...currentBB, value: currentBB.value.middle })
			bbLowerSeries.update({ ...currentBB, value: currentBB.value.lower })
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
				.filter((transaction) => transaction.symbol == data.getNewGame.symbol && transaction.status == OrderStatus.Executed)
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
			<Box sx={{ '& > :not(style)': { m: 1 }, position: 'absolute', top: 2, left: 8, zIndex: 99 }}>
				<div>
					{'Quantity: '}
					{trading.quantity.toLocaleString(undefined, {
						maximumFractionDigits: 0,
					})}
				</div>
				<div>
					{'Cash: '}
					{trading.cash.toLocaleString(undefined, {
						maximumFractionDigits: 0,
					})}
				</div>
				<div>
					{'Balance: '}
					{trading.balance.toLocaleString(undefined, {
						maximumFractionDigits: 0,
					})}
				</div>
				<div>{'..................'}</div>
				<div>{'Ema: 50'}</div>
				<div>
					{'Bollinger (20): '}
					<VisibilityBtn status={showBB} setStatus={setShowBB} />
				</div>
			</Box>
			<Box sx={{ '& > :not(style)': { m: 1 }, position: 'absolute', top: 8, right: 16, zIndex: 99 }}>
				<PlayPauseBtn playStatus={playStatus} setPlayStatus={setPlayStatus} />
				<Tooltip title="Move one step forward">
					<Fab color="primary" onClick={() => setCurrentIndex((prevIndex) => prevIndex + 1)}>
						<Forward />
					</Fab>
				</Tooltip>
				<Tooltip title="Remove All Pricelines">
					<Fab color="primary" onClick={removePriceLines}>
						<PlaylistRemoveOutlined />
					</Fab>
				</Tooltip>
			</Box>
		</Box>
	)
}

export default Chart
