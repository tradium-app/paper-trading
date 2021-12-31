import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@apollo/client'
import { createChart } from 'lightweight-charts'
import GET_NEW_GAME_QUERY from './Chart_Query'
import computeChartData from './computeChartData'
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

const Chart = () => {
	const containerId = useRef(null)
	const [candleSeries, setCandleSeries] = useState(null)
	const [volumeSeries, setVolumeSeries] = useState(null)
	const [emaSeries, setEmaSeries] = useState(null)
	const [rsiSeries, setRsiSeries] = useState(null)
	const [showEma26] = useLocalStorage('showEma26', 1)
	const [showRSI] = useLocalStorage('showRSI', 1)

	const { loading, error, data, refetch } = useQuery(GET_NEW_GAME_QUERY, {
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	})

	useEffect(() => {
		containerId.current = createChart(containerId.current, {
			width: containerId.current.offsetWidth,
			height: window.innerHeight,
		})
		setCandleSeries(containerId.current.addCandlestickSeries(candleSeriesOptions))

		containerId.current.timeScale().applyOptions({ rightOffset: 15 })
	}, [])

	let priceData, volumeData, emaData, rsiData, predictionPoint, currentIndex

	if (!loading && !error && data.getNewGame) {
		;({ priceData, volumeData, emaData, rsiData } = computeChartData(data.getNewGame, showEma26, showRSI))
		predictionPoint = priceData[data.getNewGame.price_history.length].time
	}

	if (!loading && !error && priceData) {
		candleSeries.setData(priceData.slice(0, data.getNewGame.price_history.length))
		currentIndex = data.getNewGame.price_history.length
	}

	if (!loading && !error && priceData) {
		setInterval(function () {
			currentIndex++
			candleSeries.update(priceData[currentIndex])
		}, 5000)
	}

	return <div ref={containerId} slot="fixed" />
}

export default Chart
