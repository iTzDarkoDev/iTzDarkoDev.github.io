document.getElementById('attackForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const ip = document.getElementById('ip').value;
    const port = document.getElementById('port').value;
    const duration = document.getElementById('duration').value;
    const requestsPerSecond = document.getElementById('requestsPerSecond').value;
    const method = document.getElementById('method').value;

    const response = await fetch('/attack', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip, port, duration, requestsPerSecond, method }),
    });

    const result = await response.json();
    document.getElementById('result').innerText = result.message;
});
