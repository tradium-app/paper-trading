export const emaPeriod = {
	low: 20,
	high: 50,
}
export const rsiPeriod = 14
export const bbPeriod = 20

export const toastOptions = {
	position: 'top',
	duration: 1000,
	cssClass: 'toast',
}

export const defaultChartOptions = {
	crosshair: {
		mode: 0,
	},
}

export const candleSeriesOptions = {
	priceLineVisible: false,
}

export const volumeSeriesOptions = {
	priceFormat: {
		type: 'volume',
	},
	priceScaleId: '',
	priceLineVisible: false,
	scaleMargins: {
		top: 0.8,
		bottom: 0,
	},
}

export const emaSeriesOptions = {
	lastValueVisible: false,
	priceLineVisible: false,
	crosshairMarkerVisible: false,
	lineWidth: 1,
	lineStyle: 2,
	color: 'rgba(0, 0, 255, 0.6)',
}

export const rsiSeriesOptions = {
	priceScaleId: 'left',
	priceLineVisible: false,
	color: 'rgba(235, 43, 75, 0.8)',
	lastValueVisible: true,
	crosshairMarkerVisible: false,
	lineWidth: 1,
	lineStyle: 2,
	autoscaleInfoProvider: () => ({
		priceRange: {
			minValue: 0,
			maxValue: 200,
		},
	}),
}

export const markerOptions = {
	position: 'aboveBar',
	color: '#5d58e0',
	shape: 'arrowDown',
	size: 2,
}
