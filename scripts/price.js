let ws = null;
let priceTimer = 0;
let kTimer = 0;
let kUpdateTimer = 0;
let priceTable = [];
let watchSymbols = [];

async function setupWebSocket() {
    ws = new WebSocket('wss://' + site.apiUrl + '/ws');
    ws.onopen = () => {
        clearInterval(priceTimer);
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

async function initKChart(symbol) {
    setTimeout(async function () {
        await initSite();
        await initLanguages();
        let data = await fetch("https://" + site.apiUrl + "/klines?symbol=" + symbol);
        data = await data.json();
        if(data.success) {
            data = data.data;
        }
        loadKChart(symbol, data);
        loadKChartElem(symbol,data);
        mappingLang();
        closePreloader();
    }, 300);
    
}

async function loadKChartElem(symbol, kdata) {
    $(".showSymbol").text(symbol + "/USDT");
    clearInterval(kTimer);
    kTimer = setInterval(() => {
        let data = priceTable.find(item => item.symbol === symbol);
        // 找出最高的 high
        let high = Math.max.apply(Math, kdata.map(function(o) { return o.high; }));
        // 找出最低的 low
        let low = Math.min.apply(Math, kdata.map(function(o) { return o.low; }));
        // 加總總額 quantity
        let total = kdata.reduce((a, b) => +a + +b.quantity, 0);
        let totalPrice = parseFloat((total * data.weightedAvgPrice).toFixed(2));
        totalPrice = formatPrice(totalPrice);
        $(".priceDynamic").removeClass("color-green-dark");
        $(".priceDynamic").removeClass("color-red-dark");
        $(".priceDynamic").addClass((data.priceChangePercent > 0 ? "color-green-dark" : "color-red-dark"));
        $(".priceDynamic").text(parseFloat(parseFloat(data.weightedAvgPrice).toFixed(4)));

        $(".updown").removeClass("bg-green-dark");
        $(".updown").removeClass("bg-red-dark");
        $(".updown").addClass((data.priceChangePercent > 0 ? "bg-green-dark" : "bg-red-dark"));
        $(".updown").text((data.priceChangePercent > 0 ? "+" : "") + data.priceChangePercent + "%");

        let usdPrice = data.weightedAvgPrice;
        let percentPrice = parseFloat((parseFloat(data.priceChangePercent/100) * usdPrice).toFixed(2));
        $(".coinPriceInfo").html("≈" + parseFloat(parseFloat(usdPrice).toFixed(2)) + " USD  <span class=\"" + (percentPrice > 0 ? "color-green-light" : "color-red-light") + "\">" + (percentPrice > 0 ? "+" : "") + percentPrice + " USD</span>");
    
        $(".kInfo").html("<b>24時高</b> " + parseFloat(parseFloat(high).toFixed(3)) + "  <b>24時低</b> " + parseFloat(parseFloat(low).toFixed(3)) + "  <b>24時額</b> " + totalPrice);
    }, 1000);
}

function formatPrice(number) {
    const units = [
        { value: 10**8, label: '億' },
        { value: 10**7, label: '千萬' },
        { value: 10**6, label: '百萬' },
        { value: 10**4, label: '萬' }
    ];
    let formattedStr = "";
    let count = 0;

    for (let unit of units) {
        if (number >= unit.value) {
            if (count < 2) {
                formattedStr += `${Math.floor(number / unit.value)}${unit.label}`;
                count++;
                number %= unit.value;
            }
        }
    }

    return formattedStr;
}

async function loadKChart(symbol, kData) {
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
        },
        watermark: {
            color: 'rgba(11, 94, 29, 0.4)',
            visible: true,
            text: 'i-Bot 加密助手',
            fontSize: 24,
            horzAlign: 'left',
            vertAlign: 'center'
        },
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

    // Sample data
    candlestickSeries.setData(kData);

    let volumeData = kData.map((item) => {
        return {
            time: item.time,
            value: item.quantity
        };
    });
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

    const timeScale = chart.timeScale();
    let dataLastTime, dataFirstTime;

    dataLastTime = new Date(kData[kData.length - 1].time);
    dataFirstTime = new Date(kData[0].time);

    timeScale.subscribeVisibleTimeRangeChange((range) => {
        if (!range) return;
        if (range.from < dataFirstTime) {
            console.log("range.from < dataFirstTime");
            timeScale.scrollToRealTime();
        } else if (range.to > dataLastTime) {
            console.log("range.to > dataLastTime");
            timeScale.scrollToRealTime();
        }
    });
    
    clearInterval(kUpdateTimer);

    kUpdateTimer = setInterval(async () => {
        let data = await fetch("https://" + site.apiUrl + "/klines?interval=1m&symbol=" + symbol);
        data = await data.json();
        if(data.success) {
            data = data.data;
        } else {
            return;
        }
        // 取出 data 中與 kData 不一樣的部分
        let newData = data.filter((item) => {
            return !kData.some((item2) => {
                return item.time === item2.time;
            });
        });
        // 將 newData 加入 kData
        kData = kData.concat(newData);
        candlestickSeries.update({ data: newData });
        candlestickSeries.applyNewData(newData);
    }, 1000);

}
