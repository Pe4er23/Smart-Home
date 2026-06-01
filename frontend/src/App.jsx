import { useState, useEffect } from 'react'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import './App.css'

// Настраиваем подключение к Laravel Reverb
globalThis.Pusher = Pusher;
const echo = new Echo({
  broadcaster: 'reverb',
  key: 'pwaztmtxvrmlidr9fwqq',
  wsHost: '127.0.0.1',
  wsPort: 8080,
  forceTLS: false,
  enabledTransports: ['ws', 'wss'],
});

function App() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)

  const replaceDevice = (devicesList, updatedDevice) =>
    devicesList.map(dev => (dev.id === updatedDevice.id ? updatedDevice : dev))

  useEffect(() => {
    // 1. Получаем начальные данные
    const fetchDevices = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/devices')
        const data = await response.json()
        setDevices(data)
        setLoading(false)
      } catch (error) {
        console.error("Помилка:", error)
        setLoading(false)
      }
    }
    fetchDevices()

    // 2. СЛУШАЕМ WEBSOCKETS
    // Подписываемся на канал 'home-devices'
    const channel = echo.channel('home-devices');

    // Слушаем событие 'device.updated'
    channel.listen('.device.updated', (e) => {
      console.log('Отримано оновлення з сервера:', e.device);

      // Мгновенно обновляем конкретное устройство в React
      setDevices(prevDevices => replaceDevice(prevDevices, e.device));
    });

    // Очистка при закрытии компонента
    return () => {
      channel.stopListening('.device.updated');
    };
  }, [])

  const toggleDevice = async (id) => {
    try {
      // Теперь мы просто отправляем запрос на сервер. 
      // А обновление интерфейса произойдет автоматически через WebSocket!
      await fetch(`http://127.0.0.1:8000/api/devices/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      });
    } catch (error) {
      console.error("Помилка:", error);
    }
  };

  // Универсальная функция для отправки любых значений (цвета, яркости)
  const updateDeviceState = (id, value) => {
    fetch(`http://127.0.0.1:8000/api/devices/${id}/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: value })
    })
      .then(res => res.json())
      .catch(err => console.error("Помилка управління:", err));
  };
  let colorTimeout;
  const handleColorChange = (id, color) => {
    // Якщо користувач продовжує тягати мишку, ми скасовуємо попередній таймер
    clearTimeout(colorTimeout);

    // Встановлюємо новий таймер на 300 мілісекунд
    colorTimeout = setTimeout(() => {
      updateDeviceState(id, color);
    }, 300);
  };

  let sliderTimeout;
  const handleSliderChange = (id, value) => {
    // 1. Оптимистичное обновление: мгновенно двигаем ползунок в интерфейсе
    setDevices(prev => prev.map(dev => dev.id === id ? { ...dev, status: value.toString() } : dev));

    // 2. Дебаунс: отправляем реальную команду на сервер только когда пользователь остановил ползунок
    clearTimeout(sliderTimeout);
    sliderTimeout = setTimeout(() => {
      updateDeviceState(id, value);
    }, 300);
  };


  // ФУНКЦІЯ-МАРШРУТИЗАТОР: Визначає, який інтерфейс малювати залежно від типу пристрою
  const renderDeviceControl = (device) => {
        switch (device.type) {
            case 'relay':
                return (
                    <button 
                        className={`toggle-btn ${device.status === 'on' ? 'on' : 'off'}`}
                        onClick={() => toggleDevice(device.id)}
                    >
                        {device.status === 'on' ? 'Увімкнено' : 'Вимкнено'}
                    </button>
                );

            case 'rgb_lamp':
                // 5. LED стрічка - Кнопка Вкл/Вимк + Колір
                { const isLedOff = device.status === '#000000' || device.status === 'off';
                return (
                    <div style={{ width: '100%', textAlign: 'center', marginTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
                            {/* Кнопки Вкл/Вимк */}
                            <button 
                                onClick={() => updateDeviceState(device.id, '#ffffff')}
                                className={`control-btn led-on ${isLedOff ? '' : 'active-cmd'}`}
                                disabled={!isLedOff}
                                style={{fontSize: '12px'}}
                            >
                                Увімкн.
                            </button>
                            <button 
                                onClick={() => updateDeviceState(device.id, 'off')}
                                className={`control-btn led-off ${isLedOff ? 'active-cmd' : ''}`}
                                disabled={isLedOff}
                                style={{fontSize: '12px'}}
                            >
                                Вимкн.
                            </button>
                        </div>
                        {/* Палітра працює тільки якщо увімкнено */}
                        <p style={{ marginBottom: '5px', fontSize: '12px', color: '#666' }}>Колір:</p>
                        <input 
                            type="color" 
                            value={device.status?.startsWith('#') ? device.status : '#ffffff'} 
                            onChange={(e) => handleColorChange(device.id, e.target.value)}
                            disabled={isLedOff}
                            style={{ width: '100px', height: '35px', cursor: isLedOff ? 'not-allowed' : 'pointer', border: 'none', borderRadius: '8px', opacity: isLedOff ? 0.5 : 1 }}
                        />
                    </div>
                ); }

            case 'thermostat':
                { const currentTemp = Number.parseInt(device.status) || 22;
                return (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                        <button onClick={() => updateDeviceState(device.id, currentTemp - 1)} className="control-btn">-</button>
                        <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#dadada' }}>{currentTemp}°C</span>
                        <button onClick={() => updateDeviceState(device.id, currentTemp + 1)} className="control-btn">+</button>
                    </div>
                ); }

            case 'blinds':
                // Штори (Blinds) - Слайдер + Логіка кнопок
                { const blindsPos = Number.parseInt(device.status) || 0; // 0 = закрито, 100 = відкрито
                const isFullyOpen = blindsPos === 100;
                const isFullyClosed = blindsPos === 0;

                return (
                    <div style={{ width: '100%', textAlign: 'center', marginTop: '5px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '0 5px' }}>
                            <span>Закрито</span>
                            <span>Відкрито ({blindsPos}%)</span>
                        </div>

                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={blindsPos}
                            // Коли затискаємо і крутимо ползунок (onChange), ми просто змінюємо візуал
                            onChange={(e) => handleSliderChange(device.id, e.target.value)} // Треба дебаунс, але поки так
                            className="blinds-slider"
                        />
                        
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            {/* Кнопка Відкрити (зліва): Відправляє 100% */}
                            <button 
                                onClick={() => updateDeviceState(device.id, 100)} 
                                className={`control-btn ${isFullyOpen ? 'active-cmd' : ''}`}
                                // Кнопка неклікабельна, якщо штора вже повністю відкрита
                                disabled={isFullyOpen}
                                style={{backgroundColor: '#10ad79'}}
                            >
                                Відкрити
                            </button>
                            
                            {/* Кнопка Закрити (справа): Відправляє 0% */}
                            <button 
                                onClick={() => updateDeviceState(device.id, 0)} 
                                className={`control-btn ${isFullyClosed ? 'active-cmd' : ''}`}
                                // Кнопка неклікабельна, якщо штора вже повністю закрита
                                disabled={isFullyClosed}
                                style={{backgroundColor: '#d43f3f'}}
                            >
                                Закрити
                            </button>
                        </div>
                    </div>
                ); }

            case 'lock':
                // Двері (Lock) - Слайдер/Перемикач замість кнопки
                { const isLocked = device.status === 'locked';
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
                        <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>Статус: {isLocked ? 'Заблоковано' : 'Розблоковано'}</p>
                        {/* Слайдер-перемикач: клік змінює статус */}
                        <button
                          type="button"
                          className={`lock-slider-container ${isLocked ? 'locked' : 'unlocked'}`}
                          aria-pressed={isLocked}
                          aria-label={isLocked ? 'Розблокувати двері' : 'Заблокувати двері'}
                          onClick={() => updateDeviceState(device.id, isLocked ? 'unlocked' : 'locked')}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                              e.preventDefault();
                              updateDeviceState(device.id, isLocked ? 'unlocked' : 'locked');
                            }
                          }}
                          onTouchStart={() => updateDeviceState(device.id, isLocked ? 'unlocked' : 'locked')}
                        >
                            <div className="lock-handle">
                                {isLocked ? '🔒' : '🔓'}
                            </div>
                        </button>
                    </div>
                ); }

            case 'vacuum':
                // Робот-пилосос - Статус + Логіка кнопок
                { const vacCmd = device.status; // 'start' або 'dock'
                const isCleaning = vacCmd === 'start';
                const isDocked = vacCmd === 'dock';
                
                return (
                    <div style={{ width: '100%', textAlign: 'center', marginTop: '10px' }}>
                        <p style={{ fontSize: '16px', color: '#a9bedb', fontWeight: '500', marginBottom: '10px', backgroundColor: '#3b3b3b', padding: '5px', borderRadius: '6px' }}>
                            Поточний стан: <span style={{color: isCleaning ? '#11e49d' : '#976bfd'}}>{isCleaning ? 'Прибирає' : 'На базі'}</span>
                        </p>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <button 
                                onClick={() => updateDeviceState(device.id, 'start')} 
                                className={`control-btn ${isCleaning ? 'active-cmd' : ''}`}
                                // Не можна відправити старт, якщо він уже прибирає
                                disabled={isCleaning}
                                style={{backgroundColor: '#10ad79'}}
                            >
                                ▶ Старт
                            </button>
                            <button 
                                onClick={() => updateDeviceState(device.id, 'dock')} 
                                className={`control-btn ${isDocked ? 'active-cmd' : ''}`}
                                // Не можна відправити на базу, якщо він уже там
                                disabled={isDocked}
                                style={{backgroundColor: '#976bfd'}}
                            >
                                🏠 На базу
                            </button>
                        </div>
                    </div>
                ); }

            case 'security_sensor':
                // 4. Датчик руху - Залишаємо як є (трохи красивіше)
                { const isTriggered = device.status === 'triggered';
                return (
                    <p style={{ fontSize: '18px', color: isTriggered ? '#ef4444' : '#22c55e', fontWeight: 'bold', margin: '15px 0' }}>
                        {isTriggered ? '🚨 ТРИВОГА! Рух' : '✅ Спокійно'}
                    </p>
                ); }

            case 'sensor':
            default:
                return (
                    <p style={{ fontSize: '18px', color: '#aaaaaa', margin: '10px 0' }}>
                        <strong>Поточний показник:</strong> <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{device.status}°C</span>
                    </p>
                );
        }
    };

  if (loading) return <div>Завантаження...</div>

  return (
    <div className="dashboard">
      <h1>Smart Home</h1>
      <div className="devices-grid">
        {devices.map(device => (
          <div key={device.id} className="device-card">
            <h3>{device.name}</h3>

            <p style={{ fontSize: '12px', color: '#888', marginBottom: '15px' }}>
              Тип: {device.type}
            </p>

            {/* ВИКЛИКАЄМО НАШ МАРШРУТИЗАТОР ІНТЕРФЕЙСУ */}
            {renderDeviceControl(device)}

          </div>
        ))}
      </div>
    </div>
  )
}

export default App