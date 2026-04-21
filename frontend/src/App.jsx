import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/devices')
        const data = await response.json()
        setDevices(data)
        setLoading(false)
      } catch (error) {
        console.error("Помилка при отриманні даних:", error)
        setLoading(false)
      }
    }
    fetchDevices()
  }, [])

  // НОВАЯ ФУНКЦИЯ: Отправка команды на сервер
  const toggleDevice = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/devices/${id}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      const updatedDevice = await response.json();

      // Обновляем состояние React, чтобы кнопка мгновенно перерисовалась
      setDevices(devices.map(dev => dev.id === id ? updatedDevice : dev));
    } catch (error) {
      console.error("Ошибка при переключении:", error);
    }
  };

  if (loading) {
    return <div>Завантаження пристроїв...</div>
  }

  return (
    <div className="dashboard">
      <h1>Мій Розумний Будинок</h1>
      
      <div className="devices-grid">
        {devices.map((device) => (
          <div key={device.id} className="device-card">
            <h3>{device.name}</h3>
            <p className="device-type">Тип: {device.type}</p>
            
            {/* ЕСЛИ ЭТО РЕЛЕ - ПОКАЗЫВАЕМ КНОПКУ, ИНАЧЕ - ПРОСТО ТЕКСТ */}
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