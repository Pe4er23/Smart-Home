/*  ВАЖЛИВО

    Цей скрипт не використовується через несумісність з React 19 та його новим механізмом рендерингу.
    Я залишив його в проекті для демонстрації того, як можна було б реалізувати
    графік за допомогою Recharts та WebSockets, якби не було цих обмежень.
*/

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function SensorChart({ deviceId, currentStatus }) {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        // Запрос історії (бекенд повертає дані за останні 6 годин)
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
                        value: Number.parseFloat(item.value) || 0 // Гарантуємо, що це число
                    };
                });
                
                setChartData(formattedData);
            })
            .catch(err => console.error("Помилка завантаження історії:", err));
    }, [deviceId, currentStatus]);// Слідкуємо за зміною ID та статусу з WebSockets

    if (chartData.length === 0) {
        return <p style={{ fontSize: '12px', color: '#86868b', marginTop: '15px' }}>Немає даних для графіка...</p>;
    }

    // Залізобетонний ручний розрахунок масштабу осі Y
    const tempValues = chartData.map(d => d.value);
    const minTemp = Math.floor(Math.min(...tempValues)) - 1;
    const maxTemp = Math.ceil(Math.max(...tempValues)) + 1;

    return (
        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', width: '100%' }}>
            <LineChart 
                width={310} 
                height={200} 
                data={chartData} 
                // Відступи підібрані так, щоб цифри зліва (Y) та знизу (X) не вилізали за межі карти
                margin={{ top: 10, right: 15, bottom: 15, left: -20 }}
            >
                {/* Горизонтальная сетка для наглядности изменений */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#efefef" />
                
                {/* Вісь X — Час отримання даних */}
                <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 10, fill: '#86868b' }} 
                    dy={10}
                    tickLine={false}
                />
                
                {/* Вісь Y — Градуси. Завжди зліва, з фіксованою шириною та обчисленим діапазоном */}
                <YAxis 
                    tick={{ fontSize: 11, fill: '#86868b' }} 
                    width={40}
                    domain={[minTemp, maxTemp]} 
                    tickLine={false}
                    axisInterval={0}
                />
                
                {/* Підказка під час наведення на точку */}
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff' }}
                />
                
                {/* Сама лінія графику */}
                <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2563eb" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 6 }}
                    isAnimationActive={false} // Вимикаємо анімацію для запобігання конфліктам
                />
            </LineChart>
        </div>
    );
}