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
        height: 400,
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
            },
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        priceScale: {
            borderColor: '#485c7b',
            autoScale: false,
        },
        timeScale: {
            borderColor: '#485c7b',
        },
        handleScroll: {
            vertTouchDrag: false,
        },
        handleScale: {
            vertTouchDrag: false,
            horzTouchDrag: false
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

    const timeScale = chart.timeScale();
    let dataFirstTime, dataLastTime;
    
    dataFirstTime = sampleData[0].time;
    dataLastTime = sampleData[sampleData.length - 1].time;

    // Sample data
    candlestickSeries.setData(sampleData);

    /*
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
    */
}