const axios = require('axios');

// Твой токен и ID градусника вписаны прямо сюда, чтобы всё работало без ошибок!
const YANDEX_TOKEN = 'y0__wgBEO3Uk7gCGMyFTSCsyfC7GSyyBY5AQ1ZpnJuOn_wOkDrG4eAq';
const DEVICE_ID = '23c6f5d6-493d-456d-a9e1-2a4297557a1a'; 

module.exports = async (req, res) => {
    try {
        // Запрашиваем данные именно твоего градусника
        const response = await axios.get(`https://api.iot.yandex.net/v1.0/devices/${DEVICE_ID}`, {
            headers: { 'Authorization': `Bearer ${YANDEX_TOKEN}` }
        });

        const device = response.data;
        
        // Достаем точную температуру из ответа Яндекса
        let temperature = null;
        if (device.properties) {
            const tempProperty = device.properties.find(p => p.type === 'devices.property.float' && p.parameters.instance === 'temperature');
            if (tempProperty && tempProperty.value) {
                temperature = tempProperty.value;
            }
        }

        // Отправляем температуру на твой сайт
        res.status(200).json({
            name: device.name,
            temperature: temperature,
            status: 'online'
        });

    } catch (error) {
        // Если что-то пойдет не так, сайт покажет причину
        res.status(500).json({ 
            error: "Ошибка при запросе к Яндексу", 
            details: error.response ? error.response.data : error.message 
        });
    }
};
