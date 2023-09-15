let ws = null;
let wsTrade = null;
let priceTimer = 0;
let kTimer = 0;
let kUpdateTimer = 0;
let depthTableTimer = 0;
let priceTable = [];
let watchSymbols = [];
let currentSymbol = "";
let kchartElement = null;
let tradeQueue = [];

let interval = "1d";
let intervals = [{tag: "1M", t: 60000}, {tag: "1w", t: 60000}, {tag: "1d", t: 60000}, {tag: "8h", t: 60000}, {tag: "4h", t: 60000}, {tag: "1h", t: 60000}, {tag: "15m", t: 60000}, {tag: "1m", t: 60000}, {tag: "1s", t: 1000}];

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

async function listenRealTimeTrade(symbol) {
    try {
        wsTrade.close();
    } catch(e) {}
    let wssUrl = 'wss://stream.binance.com:9443/ws/' + (symbol + "USDT").toLowerCase() + '@trade';
    wsTrade = new WebSocket(wssUrl);
    wsTrade.onopen = () => {
        $("#realtime-trade-block").empty();
    };
    wsTrade.onmessage = async (event) => {
        let data = JSON.parse(event.data);
        if(data.e == "trade") {
            tradeQueue.push(data);
            if(tradeQueue.length > 10) {
                tradeQueue.shift();
            }
            $("#realtime-trade-block").empty();
            for(let i=tradeQueue.length-1;i>=0;i--) {
                let trade = tradeQueue[i];
                // 時間
                let time = new Date(trade.E);
                let timeStr = time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
                // 價格
                let price = parseFloat(trade.p).toFixed(4);
                // 數量
                let quantity = parseFloat(trade.q).toFixed(6);

                let tr = document.createElement("tr");
                let td1 = document.createElement("td");
                td1.classList.add("color-gray-dark");
                td1.classList.add("text-start");
                td1.innerText = timeStr;
                let td2 = document.createElement("td");
                if(trade.m) {
                    td2.classList.add("color-green-dark");
                } else {
                    td2.classList.add("color-red-dark");
                }
                td2.classList.add("text-end");
                td2.innerText = price;
                let td3 = document.createElement("td");
                td3.classList.add("color-gray-dark");
                td3.classList.add("text-end");
                td3.innerText = quantity;
                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td3);
                $("#realtime-trade-block").append(tr);
            }
        }
    };
    wsTrade.onclose = (event) => {
        setTimeout(function(){
            listenRealTimeTrade(symbol);
        }, 1500);
    };
    wsTrade.onerror = (error) => {
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

async function changeInterval(newInterval) {
    if(interval == newInterval) {
        return;
    }
    interval = newInterval;
    let data = await fetch("https://" + site.apiUrl + "/klines?symbol=" + currentSymbol + "&interval=" + interval + "&t=" + new Date().getTime());
    data = await data.json();
    if(data.success) {
        data = data.data;
    }
    loadKChart(currentSymbol, data);
}

async function initPrice() {
    setupWebSocket();
}

async function initKChart(symbol) {
    currentSymbol = symbol;
    setTimeout(async function () {
        await initSite();
        await initLanguages();
        let data = await fetch("https://" + site.apiUrl + "/klines?symbol=" + symbol + "&interval=" + interval + "&t=" + new Date().getTime());
        data = await data.json();
        if(data.success) {
            data = data.data;
        }
        loadKChart(symbol, data);
        loadKChartElem(symbol,data);
        loadDepthTable(symbol);
        listenRealTimeTrade(symbol);
        mappingLang();
        closePreloader();
    }, 300);
    
}

async function loadKChartElem(symbol, kdata) {
    $("#symbolIcon").attr("src", "images/crypto/" + symbol + ".png");
    $(".showSymbol").text(symbol + "/USDT");
    clearInterval(kTimer);
    kTimer = setInterval(() => {
        let data = priceTable.find(item => item.symbol === symbol);
        // 找出最高的 high
        let high = Math.max.apply(Math, kdata.map(function(o) { return o.high; }));
        // 找出最低的 low
        let low = Math.min.apply(Math, kdata.map(function(o) { return o.low; }));
        // 加總總額 quantity
        let total = kdata.reduce((a, b) => a + b.quantity, 0);
        let totalPrice = parseFloat((total * data.weightedAvgPrice).toFixed(2));
        totalPrice = formatPrice(totalPrice);
        $(".priceDynamic").removeClass("color-green-dark");
        $(".priceDynamic").removeClass("color-red-dark");
        $(".priceDynamic").addClass((data.priceChangePercent > 0 ? "color-green-dark" : "color-red-dark"));
        // 價格在depth中計算

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

function setBidsProgress(bidsPercentage) {
    const greenDiv = document.querySelector('.bids-progress');
    const redDiv = document.querySelector('.asks-progress');
    greenDiv.style.width = `${bidsPercentage}%`;
    redDiv.style.width = `${100 - bidsPercentage}%`;
    const bidsPercentageText = document.querySelector('.bids-percentage');
    const asksPercentageText = document.querySelector('.asks-percentage');
    bidsPercentageText.innerHTML = `${bidsPercentage}%`;
    asksPercentageText.innerHTML = `${100 - bidsPercentage}%`;

}

async function loadDepthTable(symbol, precision = 0.01) {
    clearInterval(depthTableTimer);
    const container = document.getElementById("chart-container");
    const width = container.clientWidth;
    const height = container.clientHeight;
    depthTableTimer = setInterval(async () => {
        let data = await fetch("https://" + site.apiUrl + "/depth?&symbol=" + symbol + "&t=" + new Date().getTime());
        data = await data.json();
        if(data.success) {
            data = data.data;
        } else {
            return;
        }
        let asks = data.asks;
        let bids = data.bids;
        // 依據精度整理資料
        let asksData = {};
        let bidsData = {};
        asks.forEach((item) => {
            let price = parseFloat(item[0]);
            let quantity = parseFloat(item[1]);
            let key = Math.floor(price / precision) * precision;
            if(asksData[key]) {
                asksData[key] += quantity;
            } else {
                asksData[key] = quantity;
            }
        });
        bids.forEach((item) => {
            let price = parseFloat(item[0]);
            let quantity = parseFloat(item[1]);
            let key = Math.floor(price / precision) * precision;
            if(bidsData[key]) {
                bidsData[key] += quantity;
            } else {
                bidsData[key] = quantity;
            }
        });
        // 整理資料
        let asksTable = [];
        let bidsTable = [];
        for(let key in asksData) {
            asksTable.push({
                price: key,
                quantity: asksData[key]
            });
        }
        for(let key in bidsData) {
            bidsTable.push({
                price: key,
                quantity: bidsData[key]
            });
        }
        // 排序
        asksTable.sort((a, b) => {
            return a.price - b.price;
        });
        bidsTable.sort((a, b) => {
            return b.price - a.price;
        });
        // 以兩邊的傯量來計算 bidsPercentage
        let bidsTotal = bidsTable.reduce((a, b) => a + b.quantity, 0);
        let asksTotal = asksTable.reduce((a, b) => a + b.quantity, 0);
        let total = bidsTotal + asksTotal;
        let bidsPercentage = bidsTotal / total * 100;
        setBidsProgress(bidsPercentage.toFixed(0));
        // 顯示
        $("#depth-block").empty();
        // 以兩邊的第一筆資料的價格來計算均價
        let avgPrice = (parseFloat(asksTable[0].price) + parseFloat(bidsTable[0].price)) / 2;
        $(".priceDynamic").text(parseFloat(parseFloat(avgPrice).toFixed(4)));
        // 只顯示前 10 筆 使用 element 方式產生 tr td
        for(let i=0;i<10;i++) {
            let tr = document.createElement("tr");
            let td1 = document.createElement("td");
            td1.classList.add("color-gray-dark");
            td1.classList.add("text-start");
            let td2 = document.createElement("td");
            td2.classList.add("color-green-dark");
            td2.classList.add("text-end");
            let td3 = document.createElement("td");
            td3.classList.add("color-red-dark");
            td3.classList.add("text-start");
            let td4 = document.createElement("td");
            td4.classList.add("color-gray-dark");
            td4.classList.add("text-end");

            td1.innerText = bidsTable[i].quantity.toFixed(6);
            // 價格依照 precision 顯示
            td2.innerText = parseFloat(bidsTable[i].price).toFixed(precision.toString().split(".")[1].length);
            td3.innerText = parseFloat(asksTable[i].price).toFixed(precision.toString().split(".")[1].length);
            td4.innerText = asksTable[i].quantity.toFixed(6);
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            $("#depth-block").append(tr);
        }
        // 繪製深度圖
        drawDepthChart("#tab-dephGraph", asksTable, bidsTable, width, height);
    }, 1000);
}

function drawDepthChart(selector, asks, bids, width, height) {
    $(selector).empty();
    const svg = d3.select(selector).append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "xMidYMid meet");
    const x = d3.scaleLinear()
        .domain([d3.min(bids, d => d.price), d3.max(asks, d => d.price)])
        .range([0, width]);
    const y = d3.scaleLinear()
        .domain([d3.min([...bids, ...asks], d => d.quantity), d3.max([...bids, ...asks], d => d.quantity)])
        .range([height, 0]);
    // 加入 X 軸
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(6)); // 您可以透過 ticks 方法調整標籤的數量

    // 加入 Y 軸
    svg.append("g")
        .call(d3.axisLeft(y).ticks(6)); // 同樣可以調整標籤的數量
    
    for (let i = 1; i < bids.length; i++) {
        bids[i].quantity += bids[i-1].quantity;
    }
    
    for (let i = 1; i < asks.length; i++) {
        asks[i].quantity += asks[i-1].quantity;
    }
    // 繪製 bids 線
    svg.append("path")
    .datum(bids)
    .attr("fill", "none")
    .attr("stroke", "green")
    .attr("d", d3.line()
        .x(d => x(d.price))
        .y(d => y(d.quantity))
    );

    // 繪製 asks 線
    svg.append("path")
    .datum(asks)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("d", d3.line()
        .x(d => x(d.price))
        .y(d => y(d.quantity))
    );

    // 加入軸
    svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

    svg.append("g")
    .call(d3.axisLeft(y));
}

async function loadKChart(symbol, kData) {
    if(kchartElement) {
        kchartElement.remove();
    }
    kchartElement = LightweightCharts.createChart(document.getElementById('chart-container'), {
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
            borderColor: '#485c7b'
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
    kchartElement.timeScale().fitContent();
    
    const candlestickSeries = kchartElement.addCandlestickSeries({
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
    const volumeSeries = kchartElement.addHistogramSeries({
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

    const timeScale = kchartElement.timeScale();
    let dataLastTime, dataFirstTime;

    dataLastTime = new Date(kData[kData.length - 1].time);
    dataFirstTime = new Date(kData[0].time);

    timeScale.subscribeVisibleTimeRangeChange((range) => {
        if (!range) return;
        if (range.from < dataFirstTime) {
            timeScale.scrollToRealTime();
        } else if (range.to > dataLastTime) {
            timeScale.scrollToRealTime();
        }
    });

    timeScale.applyOptions({
        barSpacing: 6
    });
    
    clearInterval(kUpdateTimer);

    let t = intervals.find((item) => {
        return item.tag == interval;
    }).t;

    kUpdateTimer = setInterval(async () => {
        let data = await fetch("https://" + site.apiUrl + "/klines?interval=" + interval + "&symbol=" + symbol + "&t=" + new Date().getTime());
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
        if(newData.length>0) {
            for(let i=0;i<newData.length;i++) {
                candlestickSeries.update(newData[i]);
                let updateVData = {
                    time: newData[i].time,
                    value: newData[i].quantity
                };
                volumeSeries.update(updateVData);
            }
        }
    }, t);

}
