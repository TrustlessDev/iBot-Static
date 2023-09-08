let ws = null;

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
            queryPrice();
        }
    };
    ws.onclose = (event) => {
        setTimeout(setupWebSocket, 1500);
    };
    ws.onerror = (error) => {
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
