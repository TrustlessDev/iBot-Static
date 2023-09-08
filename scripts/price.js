let ws = null;
let priceTimer = 0;
let priceTable = [];

async function setupWebSocket() {
    ws = new WebSocket('wss://' + site.apiUrl + '/ws');
    ws.onopen = () => {
        sendMessage({
            type: 'ping'
        });
    };
    ws.onmessage = (event) => {
        let data = JSON.parse(event.data);
        if (data.type === 'pong') {
            priceTimer = setInterval(() => {
                queryPrice();
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

function queryPrice() {
    sendMessage({
        type: 'price',
        data: ["ETH", "BTC", "BCH"]
    });
}
