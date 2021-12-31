import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import { createChart } from 'lightweight-charts';
import { useLocalStorage } from 'beautiful-react-hooks';
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
    rsiSeriesOptions
} from './configs';
import GET_NEW_GAME_QUERY from './Chart_Query';
import computeChartData from './computeChartData';

const Chart = () => {
    const [score, setScore] = useLocalStorage('score', 0);
    const [transactions, setTransactions] = useLocalStorage('transactions', 0);
    const [balance, setBalance] = useLocalStorage('balance', 10000);
    const [currentProfit, setCurrentProfit] = useLocalStorage('profit', 0);
    const [showEma26] = useLocalStorage('showEma26', 1);
    const [showRSI] = useLocalStorage('showRSI', 1);

    // const [showToast] = useIonToast();
    // const [showAlert] = useIonAlert();
    const containerId = useRef(null);
    const { loading, error, data, refetch } = useQuery(GET_NEW_GAME_QUERY, {
        fetchPolicy: 'no-cache',
        notifyOnNetworkStatusChange: true
    });
    const [predicted, setPredicted] = useState(false);
    const [skipped, setSkipped] = useState(false);
    const [candleSeries, setCandleSeries] = useState(null);
    const [volumeSeries, setVolumeSeries] = useState(null);
    const [emaSeries, setEmaSeries] = useState(null);
    const [rsiSeries, setRsiSeries] = useState(null);

    useEffect(() => {
        containerId.current = createChart(containerId.current, {
            width: 1000,
            height: window.innerHeight
        });
        setCandleSeries(containerId.current.addCandlestickSeries(candleSeriesOptions));

        const volSeries = containerId.current.addHistogramSeries(volumeSeriesOptions);
        setVolumeSeries(volSeries);

        const emaSeries = containerId.current.addLineSeries(emaSeriesOptions);
        setEmaSeries(emaSeries);

        const rsiSeries = containerId.current.addLineSeries(rsiSeriesOptions);
        setRsiSeries(rsiSeries);

        containerId.current.timeScale().applyOptions({ rightOffset: 15 });
    }, []);

    let priceData, volumeData, emaData, rsiData, predictionPoint;

    if (!loading && !error && data.getNewGame) {
        ({ priceData, volumeData, emaData, rsiData } = computeChartData(data.getNewGame, showEma26, showRSI));
        predictionPoint = priceData[data.getNewGame.price_history.length].time;
    }

    useEffect(() => {
        if ((predicted || skipped) && priceData) {
            for (let index = data.getNewGame.price_history.length; index < priceData.length; index++) {
                candleSeries.update(priceData[index]);
                volumeSeries.update(volumeData[index]);
            }

            showEma26 &&
                emaData
                    .filter((ed) => ed.time > predictionPoint)
                    .forEach((ed) => {
                        emaSeries.update(ed);
                    });

            showRSI &&
                rsiData
                    .filter((ed) => ed.time > predictionPoint)
                    .forEach((ed) => {
                        rsiSeries.update(ed);
                    });
        }
    }, [predicted, skipped]);

    if (!loading && !error && priceData && !predicted && !skipped) {
        candleSeries.setData(priceData.slice(0, data.getNewGame.price_history.length));
        volumeSeries.setData(volumeData.slice(0, data.getNewGame.price_history.length));
        showEma26 && emaSeries.setData(emaData.filter((ed) => ed.time <= predictionPoint));

        showRSI && rsiSeries.setData(rsiData.filter((ed) => ed.time <= predictionPoint));

        containerId.current.applyOptions(defaultChartOptions);
        containerId.current.timeScale().fitContent();

        const lastTimeStamp = priceData[data.getNewGame.price_history.length - 1].time;

        const markers = [
            {
                ...markerOptions,
                time: lastTimeStamp
            }
        ];

        candleSeries.setMarkers(markers);
    }

    // const predict = (action) => {
    //     if (predicted) {
    //         let message = `You already ${currentProfit > 0 ? 'gained' : 'lost'} ${Math.abs(currentProfit).toLocaleString(undefined, {
    //             maximumFractionDigits: 0
    //         })}.  Press Next for new prediction.`;

    //         showToast({
    //             ...toastOptions,
    //             message
    //         });

    //         return;
    //     } else if (skipped) {
    //         showToast({
    //             ...toastOptions,
    //             message: 'Press Next for new prediction.'
    //         });
    //         return;
    //     }

    //     const newBalance = computeNewBalance(
    //         action,
    //         balance,
    //         priceData[data.getNewGame.price_history.length - 1].close,
    //         priceData[priceData.length - 1].close
    //     );

    //     const change = Math.abs(newBalance - balance).toLocaleString(undefined, {
    //         maximumFractionDigits: 0
    //     });

    //     let message = newBalance > balance ? 'Bravo!. ' : 'Oops!. ';
    //     message += `You ${newBalance > balance ? 'gained' : 'lost'} ${change}.`;

    //     showToast({
    //         ...toastOptions,
    //         message
    //     });

    //     setCurrentProfit(newBalance - balance);
    //     setBalance(newBalance);
    //     setTransactions(transactions + 1);
    //     newBalance > balance && setScore(score + 1);

    //     containerId.current.applyOptions(afterPredictionChartOptions);
    //     setPredicted(true);
    // };

    // const nextGame = () => {
    //     setPredicted(false);
    //     setSkipped(false);
    //     refetch();
    // };

    // const skipGame = () => {
    //     setSkipped(true);
    // };

    // const resetBalance = () => {
    //     showAlert({
    //         header: 'Losing money 😅 ?',
    //         message: 'Want to reset balance to 10,000?',
    //         buttons: [
    //             'Cancel',
    //             {
    //                 text: 'Yes',
    //                 handler: () => {
    //                     setBalance(10000);
    //                     setScore(0);
    //                     setTransactions(0);
    //                 }
    //             }
    //         ]
    //     });
    // };

    return <div ref={containerId} slot="fixed" />;
};

const computeNewBalance = (action, initialBalance, purchasePrice, sellPrice) => {
    const percentChange = (sellPrice - purchasePrice) / purchasePrice;

    return action === 'buy' ? initialBalance * (1 + percentChange) : initialBalance * (1 - percentChange);
};

export default Chart;
