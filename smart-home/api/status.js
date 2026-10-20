const axios = require('axios');

const YANDEX_TOKEN = 'y0__wgBEO3Uk7gCGMyFTSDC19C7GYDcxBR7-C92EV9_XnJsPHNKY6pQ';

// ВСТАВЬ СЮДА СВОИ ДАННЫЕ ИЗ ЯНДЕКСА:
const SENSOR_ID = 'ВСТАВЬ_ID_ДАТЧИКА_ТЕМПЕРАТУРЫ'; 
const SCENARIO_HOT_ID = 'ВСТАВЬ_ID_СЦЕНАРИЯ_ЖАРА'; 
const SCENARIO_COLD_ID = 'ВСТАВЬ_ID_СЦЕНАРИЯ_ХОЛОД'; 
const SCENARIO_NORMAL_ID = 'ВСТАВЬ_ID_СЦЕНАРИЯ_ОТКЛЮЧЕНИЯ';

let lastAlertTime = 0; 
let lastAlertType = 'normal'; // Запоминает, что сейчас делает кондей

module.exports = async function handler(req, res) {
    try {
        const sensorRes = await axios.get(`https://api.iot.yandex.net/v1.0/devices/${SENSOR_ID}`, {
            headers: { 'Authorization': `Bearer ${YANDEX_TOKEN}` }
        });
        
        const tempProperty = sensorRes.data.properties.find(p => p.parameters.instance === 'temperature');
        const temp = tempProperty ? tempProperty.state.value : null;

        if (temp === null) return res.status(500).json({ error: 'Датчик оффлайн' });

        let status = 'normal';
        let alertMessage = '✅ Температура идеальна!';
        const now = Date.now();
        const cooldown = 30 * 60 * 1000; 

        // 1. СЛИШКОМ ЖАРКО (>= 30)
        if (temp >= 30) {
            status = 'hot';
            alertMessage = 'КРИТИЧЕСКАЯ ЖАРА! Включаю охлаждение.';
            if (now - lastAlertTime > cooldown || lastAlertType !== 'hot') {
                await axios.post(`https://api.iot.yandex.net/v1.0/scenarios/${SCENARIO_HOT_ID}/actions`, {}, { headers: { 'Authorization': `Bearer ${YANDEX_TOKEN}` } }).catch(()=>{});
                lastAlertTime = now;
                lastAlertType = 'hot';
            }
        } 
        // 2. СЛИШКОМ ХОЛОДНО (<= 20)
        else if (temp <= 20) {
            status = 'cold';
            alertMessage = 'ОЧЕНЬ ХОЛОДНО! Включаю обогрев.';
            if (now - lastAlertTime > cooldown || lastAlertType !== 'cold') {
                await axios.post(`https://api.iot.yandex.net/v1.0/scenarios/${SCENARIO_COLD_ID}/actions`, {}, { headers: { 'Authorization': `Bearer ${YANDEX_TOKEN}` } }).catch(()=>{});
                lastAlertTime = now;
                lastAlertType = 'cold';
            }
        } 
        // 3. ЗОЛОТАЯ СЕРЕДИНА (24 - 26 градусов) -> Отключаем климат
        else if (temp >= 24 && temp <= 26) {
            status = 'normal';
            if (lastAlertType === 'hot' || lastAlertType === 'cold') {
                await axios.post(`https://api.iot.yandex.net/v1.0/scenarios/${SCENARIO_NORMAL_ID}/actions`, {}, { headers: { 'Authorization': `Bearer ${YANDEX_TOKEN}` } }).catch(()=>{});
                lastAlertType = 'normal';
                lastAlertTime = 0;
            }
        }
        // 4. ПРОЦЕСС ИДЕТ (достижение цели)
        else {
            status = lastAlertType === 'hot' ? 'hot' : (lastAlertType === 'cold' ? 'cold' : 'normal');
            if (status === 'hot') alertMessage = `Охлаждаем комнату до 25°... (Сейчас ${temp}°)`;
            if (status === 'cold') alertMessage = `Нагреваем комнату до 25°... (Сейчас ${temp}°)`;
        }

        res.status(200).json({ temperature: temp, status, alertMessage });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}