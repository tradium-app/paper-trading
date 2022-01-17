import moment from 'moment'
import { ema, rsi } from 'technicalindicators'
import { emaPeriod, rsiPeriod } from './configs'

const computeChartData = (gameData, showRSI) => {
	let priceData = [...gameData.price_history, ...gameData.future_price_history]

	priceData = priceData
		.sort((a, b) => (a.timeStamp > b.timeStamp ? 1 : -1))
		.map((price) => {
			return {
				open: price.open,
				close: price.close,
				low: price.low,
				high: price.high,
				volume: price.volume,
				time: moment.unix(price.timeStamp / 1000).format('YYYY-MM-DD'),
			}
		})

	const volumeData = priceData.map((d) => ({
		time: d.time,
		value: d.volume,
		color: d.open > d.close ? 'rgba(255,82,82, 0.2)' : 'rgba(0, 150, 136, 0.2)',
	}))

	const emaData = {
		high: computeSignalData(priceData, emaPeriod.high, ema),
		low: computeSignalData(priceData, emaPeriod.low, ema),
	}

	let rsiData = []
	showRSI && (rsiData = computeSignalData(priceData, rsiPeriod, rsi))

	return { priceData, volumeData, emaData, rsiData }
}

const computeSignalData = (priceData, period, computeFunction) => {
	const inputData = priceData.map((d) => d.close)
	const dataOnClose = computeFunction({
		period,
		values: inputData,
	})

	return priceData.slice(period).map((d, index) => ({
		time: d.time,
		close: d.close,
		value: dataOnClose[index],
	}))
}

export default computeChartData
