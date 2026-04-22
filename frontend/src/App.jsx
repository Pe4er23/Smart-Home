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
        setDevices(prevDevices => 
            prevDevices.map(dev => dev.id === e.device.id ? e.device : dev)
        );
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

  if (loading) return <div>Завантаження...</div>

  return (
    <div className="dashboard">
      <h1>Smart Home</h1>
      <div className="devices-grid">
        {devices.map((device) => (
          <div key={device.id} className="device-card">
            <h3>{device.name}</h3>
            <p className="device-type">Тип: {device.type}</p>
            {device.type === 'relay' ? (
              <button 
                className={`toggle-btn ${device.status === 'on' ? 'on' : 'off'}`}
                onClick={() => toggleDevice(device.id)}
              >
                {device.status === 'on' ? 'Увімкнено' : 'Вимкнено'}
              </button>
            ) : (
              <p className="device-status"><strong>Показник:</strong> {device.status}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App