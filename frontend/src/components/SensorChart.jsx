/*  ВАЖНО 

    Этот скрипт не используется по причине
    несовместимости с React 19 и его новым механизмом рендеринга.
    Я оставил его в проекте для демонстрации того, как можно было бы реализовать
    график с помощью Recharts и WebSockets, если бы не было этих ограничений.
*/

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function SensorChart({ deviceId, currentStatus }) {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        // Запрос истории (бэкенд возвращает данные за последние 6 часов)
        fetch(`http://127.0.0.1:8000/api/devices/${deviceId}/history`)
            .then(res => res.json())
            .then(data => {
                if (!Array.isArray(data)) return;

                const formattedData = data.map(item => {
                    const dateObj = new Date(item.created_at);
                    const timeString = dateObj.toLocaleTimeString('uk-UA', {
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                    });

                    return {
                        time: timeString,
                        value: parseFloat(item.value) || 0 // Гарантируем, что это число
                    };
                });
                
                setChartData(formattedData);
            })
            .catch(err => console.error("Помилка завантаження історії:", err));
    }, [deviceId, currentStatus]); // Следим за изменением ID и статуса из WebSockets

    if (chartData.length === 0) {
        return <p style={{ fontSize: '12px', color: '#86868b', marginTop: '15px' }}>Немає даних для графіка...</p>;
    }

    // Железобетонный ручной расчет масштаба оси Y
    const tempValues = chartData.map(d => d.value);
    const minTemp = Math.floor(Math.min(...tempValues)) - 1;
    const maxTemp = Math.ceil(Math.max(...tempValues)) + 1;

    return (
        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', width: '100%' }}>
            <LineChart 
                width={310} 
                height={200} 
                data={chartData} 
                // Отступы подобраны так, чтобы цифры слева (Y) и снизу (X) не вылезали за карту
                margin={{ top: 10, right: 15, bottom: 15, left: -20 }}
            >
                {/* Горизонтальная сетка для наглядности изменений */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#efefef" />
                
                {/* Ось X — Время получения данных */}
                <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 10, fill: '#86868b' }} 
                    dy={10}
                    tickLine={false}
                />
                
                {/* Ось Y — Градусы. Всегда слева, с фиксированной шириной и вычисленным диапазоном */}
                <YAxis 
                    tick={{ fontSize: 11, fill: '#86868b' }} 
                    width={40}
                    domain={[minTemp, maxTemp]} 
                    tickLine={false}
                    axisInterval={0}
                />
                
                {/* Всплывающая подсказка при наведении на точку */}
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff' }}
                />
                
                {/* Сама линия графика */}
                <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2563eb" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 6 }}
                    isAnimationActive={false} // Отключаем анимацию для предотвращения конфликтов в React 19
                />
            </LineChart>
        </div>
    );
}