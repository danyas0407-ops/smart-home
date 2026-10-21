const axios = require('axios');

// Твой актуальный токен Умного дома
const YANDEX_TOKEN = 'y0__wgBEO3Uk7gCGMyFTSCsyfC7GSyyBY5AQ1ZpnJuOn_wOkDrG4eAq';

async function getDevices() {
    try {
        // Правильный адрес для получения списка устройств в API Яндекса
        const response = await axios.get('https://api.iot.yandex.net/v1.0/user/info', {
            headers: { 'Authorization': `Bearer ${YANDEX_TOKEN}` }
        });

        console.log("=== ТВОИ УСТРОЙСТВА ===");
        
        // Яндекс возвращает устройства внутри объекта households или directly в devices
        const households = response.data.households || [];
        households.forEach(household => {
            if (household.devices) {
                household.devices.forEach(device => {
                    console.log(`Название: ${device.name}`);
                    console.log(`ID: ${device.id}`);
                    console.log(`Тип: ${device.type}`);
                    console.log('------------------------');
                });
            }
        });

        // Если устройства прилетели общим списком
        if (response.data.devices) {
            response.data.devices.forEach(device => {
                console.log(`Название: ${device.name}`);
                console.log(`ID: ${device.id}`);
                console.log(`Тип: ${device.type}`);
                console.log('------------------------');
            });
        }

    } catch (error) {
        console.error("Ошибка:", error.response ? error.response.data : error.message);
    }
}

getDevices();
