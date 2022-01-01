import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@apollo/client'
import { createChart } from 'lightweight-charts'
import GET_NEW_GAME_QUERY from './Chart_Query'
import computeChartData from './computeChartData'
import { useLocalStorage } from 'beautiful-react-hooks'
import { emaPeriod, defaultChartOptions, afterPredictionChartOptions, candleSeriesOptions, volumeSeriesOptions, emaSeriesOptions } from './configs'

const Chart = () => {
	const containerId = useRef(null)
	const [candleSeries, setCandleSeries] = useState(null)
	const [volumeSeries, setVolumeSeries] = useState(null)
	const [emaSeries, setEmaSeries] = useState(null)
	const [showEma26] = useLocalStorage('showEma26', 1)
	const [showRSI] = useLocalStorage('showRSI', 1)

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

	let priceData, volumeData, emaData, predictionPoint, currentIndex

	if (!loading && !error && data.getNewGame) {
		;({ priceData, volumeData, emaData } = computeChartData(data.getNewGame, showEma26, showRSI))
		predictionPoint = priceData[data.getNewGame.price_history.length].time
	}

	if (!loading && !error && priceData) {
		candleSeries.setData(priceData.slice(0, data.getNewGame.price_history.length))
		volumeSeries.setData(volumeData.slice(0, data.getNewGame.price_history.length))
		showEma26 && emaSeries.setData(emaData.filter((ed) => ed.time <= predictionPoint))

		currentIndex = data.getNewGame.price_history.length - 1
	}

	if (!loading && !error && priceData) {
		setInterval(function () {
			currentIndex++
			candleSeries.update(priceData[currentIndex])
			volumeSeries.update(volumeData[currentIndex])
			showEma26 && emaSeries.update(emaData[currentIndex - emaPeriod])
		}, 5000)
	}

	return <div ref={containerId} slot="test" />
}

export default Chart
