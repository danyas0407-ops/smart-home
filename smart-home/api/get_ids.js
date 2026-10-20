const axios = require('axios');

const YANDEX_TOKEN = 'y0__wgBEO3Uk7gCGMyFTSDC19C7GYDcxBR7-C92EV9_XnJsPHNKY6pQ';

async function getInfo() {
    try {
        const response = await axios.get('https://api.iot.yandex.net/v1.0/user/info', {
            headers: { 'Authorization': `Bearer ${YANDEX_TOKEN}` }
        });
        
        console.log("=== ТВОИ СЦЕНАРИИ ===");
        response.data.scenarios.forEach(scenario => {
            console.log(`Название: ${scenario.name}`);
            console.log(`ID: ${scenario.id}`);
            console.log('-------------------');
        });
        
    } catch (error) {
        console.error("Ошибка:", error.message);
    }
}

getInfo();