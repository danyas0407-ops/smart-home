const axios = require('axios');

// Твой токен Яндекса
const YANDEX_TOKEN = 'y0__wgBEO3Uk7gCGMyFTSCsyfC7GSyyBY5AQ1ZpnJuOn_wOkDrG4eAq';

// Тот самый выделенный ID "Рекуша термометр"
const DEVICE_ID = '6953b637-b0a4-44ff-9ab3-e8345f385105'; 

module.exports = async (req, res) => {
    try {
        // Безопасный запрос: берем данные из памяти Яндекса (кэша)
        const response = await axios.get(`https://api.iot.yandex.net/v1.0/user/info`, {
            headers: { 'Authorization': `Bearer ${YANDEX_TOKEN}` }
        });

        const data = response.data;
        let targetDevice = null;

        // Ищем градусник "Рекуша термометр" в кэше
        if (data.households) {
            for (const household of data.households) {
                if (household.devices) {
                    const found = household.devices.find(d => d.id === DEVICE_ID);
                    if (found) {
                        targetDevice = found;
                        break;
                    }
                }
            }
        }

        if (!targetDevice) {
            return res.status(404).json({ error: "Градусник не найден в кэше" });
        }
        
        // Достаем температуру
        let temperature = null;
        if (targetDevice.properties) {
            const tempProperty = targetDevice.properties.find(p => p.type === 'devices.property.float' && p.parameters.instance === 'temperature');
            if (tempProperty && tempProperty.state && tempProperty.state.value !== undefined) {
                temperature = tempProperty.state.value;
            }
        }

        res.status(200).json({
            name: targetDevice.name,
            temperature: temperature,
            status: 'online'
        });

    } catch (error) {
        res.status(500).json({ 
            error: "Ошибка при запросе к Яндексу", 
            details: error.response ? error.response.data : error.message 
        });
    }
};
