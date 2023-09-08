let ws = null;

async function setupWebSocket() {
    return new Promise((resolve, reject) => {
        let ws = new WebSocket('ws://' + site.apiUrl + '/ws');
        console.log('Connecting to WebSocket...');
        ws.onopen = () => {
            console.log('Connected to WebSocket');
            resolve(ws);
        };
        ws.onmessage = (event) => {
            console.log('Received from server:', event.data);
        };
        ws.onclose = (event) => {
            console.log('WebSocket closed. Reconnecting in 3 seconds...', event);
            setTimeout(setupWebSocket, 3000); // 如果連接關閉，則在3秒後重試
        };
        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };
    });
}

function sendMessage() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('Hello from client!');
    } else {
        console.error('WebSocket is not open. Cannot send message.');
    }
}
