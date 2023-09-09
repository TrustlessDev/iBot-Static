let ws = null;
let priceTimer = 0;
let priceTable = [];
let watchSymbols = [];

async function setupWebSocket() {
    ws = new WebSocket('wss://' + site.apiUrl + '/ws');
    ws.onopen = () => {
        sendMessage({
            type: 'ping'
        });
    };
    ws.onmessage = async (event) => {
        let data = JSON.parse(event.data);
        if (data.type === 'pong') {
            let tmp = await fetch("https://" + site.apiUrl + "/symbolList");
            let symbolList = await tmp.json();
            watchSymbols = symbolList.data;
            priceTimer = setInterval(() => {
                sendMessage({
                    type: 'price',
                    data: watchSymbols
                });
            }, 1000);
        } else if (data.type === 'price') {
            priceTable = data.data;
        }
    };
    ws.onclose = (event) => {
        clearInterval(priceTimer);
        setTimeout(setupWebSocket, 1500);
    };
    ws.onerror = (error) => {
        clearInterval(priceTimer);
        console.error('WebSocket Error:', error);
    };
}

function sendMessage(obj) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(obj));
    } else {
        console.error('WebSocket is not open. Cannot send message.');
    }
}

async function initPrice() {
    setupWebSocket();
}

async function initKChart() {
    setTimeout(async function () {
        await initSite();
        await initLanguages();
        loadKChart();
        mappingLang();
        closePreloader();
    }, 300);
    
}

async function loadKChart() {
    const chart = LightweightCharts.createChart(document.getElementById('chart-container'), {
        width: document.body.clientWidth,
        height: 300,
        layout: {
            backgroundColor: '#253248',
            textColor: 'rgba(255, 255, 255, 0.9)',
        },
        grid: {
            vertLines: {
                color: '#334158',
            },
            horzLines: {
                color: '#334158',
            }
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal
        },
        priceScale: {
            borderColor: '#485c7b',
        },
        timeScale: {
            borderColor: '#485c7b',
        },
        handleScroll: {
            vertTouchDrag: false, 
        },
        handleScale: {
            vertTouchDrag: false,
        }
    });
    chart.timeScale().fitContent();
    
    const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#4BFF67',
        downColor: '#FF4976',
        borderDownColor: '#FF4976',
        borderUpColor: '#4BFF67',
        wickDownColor: '#FF4976',
        wickUpColor: '#4BFF67',
    });
    
    let sampleData = await fetch("scripts/sampleData.json?t=1");
    sampleData = await sampleData.json();

    // Sample data
    candlestickSeries.setData(sampleData);

    let volumeData = await fetch("scripts/sampleData2.json");
    volumeData = await volumeData.json();
    const volumeSeries = chart.addHistogramSeries({
        color: '#182233',
        lineWidth: 2,
        priceFormat: {
            type: 'volume',
        },
        overlay: true,
        scaleMargins: {
            top: 0.8,
            bottom: 0,
        },
    });
  
    volumeSeries.setData(volumeData);

    const lineSeries = chart.addLineSeries();

    const timeScale = chart.timeScale();
    timeScale.subscribeVisibleTimeRangeChange(function(range) {
        const visibleRange = timeScale.getVisibleRange();
        if (!visibleRange) return;

        const visibleData = sampleData.filter(item => item.time >= visibleRange.from && item.time <= visibleRange.to);
        if (visibleData.length === 0) return;

        const highest = visibleData.reduce((prev, curr) => curr.high > prev.high ? curr : prev);
        const lowest = visibleData.reduce((prev, curr) => curr.low < prev.low ? curr : prev);

        lineSeries.setMarkers([
            {
                time: highest.time,
                position: 'inBar',
                color: 'green',
                shape: 'arrowUp',
            },
            {
                time: lowest.time,
                position: 'inBar',
                color: 'red',
                shape: 'arrowDown',
            }
        ]);
    });
    
}
