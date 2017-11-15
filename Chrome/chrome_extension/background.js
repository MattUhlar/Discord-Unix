let socket = io('http://localhost:8000');
socket.on('history', (data) => {
	chrome.history.search({'text': ''}, (historyItems) => {
		data.history = historyItems;
		socket.emit('history_response', {data: data});
	});
});

