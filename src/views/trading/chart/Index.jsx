import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@apollo/client'
import { createChart } from 'lightweight-charts'
import { useLocalStorage } from 'beautiful-react-hooks'
import {
	emaPeriod,
	rsiPeriod,
	toastOptions,
	defaultChartOptions,
	afterPredictionChartOptions,
	candleSeriesOptions,
	volumeSeriesOptions,
	markerOptions,
	emaSeriesOptions,
	rsiSeriesOptions,
} from './configs'
import GET_NEW_GAME_QUERY from './Chart_Query'
import computeChartData from './computeChartData'

const Chart = () => {
	const [score, setScore] = useLocalStorage('score', 0)
	const [transactions, setTransactions] = useLocalStorage('transactions', 0)
	const [balance, setBalance] = useLocalStorage('balance', 10000)
	const [currentProfit, setCurrentProfit] = useLocalStorage('profit', 0)
	const [showEma26] = useLocalStorage('showEma26', 1)
	const [showRSI] = useLocalStorage('showRSI', 1)

	const containerId = useRef(null)
	const { loading, error, data, refetch } = useQuery(GET_NEW_GAME_QUERY, {
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	})
	const [predicted, setPredicted] = useState(false)
	const [skipped, setSkipped] = useState(false)
	const [candleSeries, setCandleSeries] = useState(null)
	const [volumeSeries, setVolumeSeries] = useState(null)
	const [emaSeries, setEmaSeries] = useState(null)
	const [rsiSeries, setRsiSeries] = useState(null)

	useEffect(() => {
		containerId.current = createChart(containerId.current, {
			width: containerId.current.offsetWidth,
			height: window.innerHeight,
		})
		setCandleSeries(containerId.current.addCandlestickSeries(candleSeriesOptions))

		const volSeries = containerId.current.addHistogramSeries(volumeSeriesOptions)
		setVolumeSeries(volSeries)

		const emaSeries = containerId.current.addLineSeries(emaSeriesOptions)
		setEmaSeries(emaSeries)

		const rsiSeries = containerId.current.addLineSeries(rsiSeriesOptions)
		setRsiSeries(rsiSeries)

		containerId.current.timeScale().applyOptions({ rightOffset: 15 })
	}, [])

	let priceData, volumeData, emaData, rsiData, predictionPoint

	if (!loading && !error && data.getNewGame) {
		;({ priceData, volumeData, emaData, rsiData } = computeChartData(data.getNewGame, showEma26, showRSI))
		predictionPoint = priceData[data.getNewGame.price_history.length].time
	}

	useEffect(() => {
		if ((predicted || skipped) && priceData) {
			for (let index = data.getNewGame.price_history.length; index < priceData.length; index++) {
				candleSeries.update(priceData[index])
				volumeSeries.update(volumeData[index])
			}

			showEma26 &&
				emaData
					.filter((ed) => ed.time > predictionPoint)
					.forEach((ed) => {
						emaSeries.update(ed)
					})

			showRSI &&
				rsiData
					.filter((ed) => ed.time > predictionPoint)
					.forEach((ed) => {
						rsiSeries.update(ed)
					})
		}
	}, [predicted, skipped])

	if (!loading && !error && priceData && !predicted && !skipped) {
		candleSeries.setData(priceData.slice(0, data.getNewGame.price_history.length))
		volumeSeries.setData(volumeData.slice(0, data.getNewGame.price_history.length))
		showEma26 && emaSeries.setData(emaData.filter((ed) => ed.time <= predictionPoint))

		showRSI && rsiSeries.setData(rsiData.filter((ed) => ed.time <= predictionPoint))

		containerId.current.applyOptions(defaultChartOptions)
		containerId.current.timeScale().fitContent()

		const lastTimeStamp = priceData[data.getNewGame.price_history.length - 1].time

		const markers = [
			{
				...markerOptions,
				time: lastTimeStamp,
			},
		]

		candleSeries.setMarkers(markers)

		var lastClose = priceData[priceData.length - 1].close
		var lastIndex = priceData.length - 1

		var targetIndex = lastIndex + 105 + Math.round(Math.random() + 30)
		var targetPrice = getRandomPrice()

		var currentIndex = lastIndex + 1
		var currentBusinessDay = { day: 29, month: 5, year: 2019 }
		var ticksInCurrentBar = 0
		var currentBar = {
			open: null,
			high: null,
			low: null,
			close: null,
			time: currentBusinessDay,
		}
	}

	function mergeTickToBar(price) {
		if (currentBar.open === null) {
			currentBar.open = price
			currentBar.high = price
			currentBar.low = price
			currentBar.close = price
		} else {
			currentBar.close = price
			currentBar.high = Math.max(currentBar.high, price)
			currentBar.low = Math.min(currentBar.low, price)
		}
		candleSeries.update(currentBar)
	}

	function reset() {
		candleSeries.setData(priceData)
		lastClose = priceData[priceData.length - 1].close
		lastIndex = priceData.length - 1

		targetIndex = lastIndex + 5 + Math.round(Math.random() + 30)
		targetPrice = getRandomPrice()

		currentIndex = lastIndex + 1
		currentBusinessDay = { day: 29, month: 5, year: 2019 }
		ticksInCurrentBar = 0
	}

	function getRandomPrice() {
		return 10 + Math.round(Math.random() * 10000) / 100
	}

	function nextBusinessDay(time) {
		var d = new Date()
		d.setUTCFullYear(time.year)
		d.setUTCMonth(time.month - 1)
		d.setUTCDate(time.day + 1)
		d.setUTCHours(0, 0, 0, 0)
		return {
			year: d.getUTCFullYear(),
			month: d.getUTCMonth() + 1,
			day: d.getUTCDate(),
		}
	}

	if (!loading && !error && priceData) {
		setInterval(function () {
			var deltaY = targetPrice - lastClose
			var deltaX = targetIndex - lastIndex
			var angle = deltaY / deltaX
			var basePrice = lastClose + (currentIndex - lastIndex) * angle
			var noise = 0.1 - Math.random() * 0.2 + 1.0
			var noisedPrice = basePrice * noise
			mergeTickToBar(noisedPrice)
			if (++ticksInCurrentBar === 5) {
				// move to next bar
				currentIndex++
				currentBusinessDay = nextBusinessDay(currentBusinessDay)
				currentBar = {
					open: null,
					high: null,
					low: null,
					close: null,
					time: currentBusinessDay,
				}
				ticksInCurrentBar = 0
				if (currentIndex === 5000) {
					reset()
					return
				}
				if (currentIndex === targetIndex) {
					// change trend
					lastClose = noisedPrice
					lastIndex = currentIndex
					targetIndex = lastIndex + 5 + Math.round(Math.random() + 30)
					targetPrice = getRandomPrice()
				}
			}
		}, 3000)
	}

	return <div ref={containerId} slot="fixed" />
}

export default Chart
