import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // Створюємо "сховище" (state) для наших пристроїв
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)

  // useEffect спрацьовує один раз при завантаженні сторінки
  useEffect(() => {
    // Функція для отримання даних з нашого Laravel API
    const fetchDevices = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/devices')
        const data = await response.json()
        setDevices(data) // Зберігаємо отримані дані
        setLoading(false)
      } catch (error) {
        console.error("Помилка при отриманні даних:", error)
        setLoading(false)
      }
    }

    fetchDevices()
  }, []) // Порожній масив означає "виконати лише раз"

  // Якщо дані ще вантажаться
  if (loading) {
    return <div>Завантаження пристроїв...</div>
  }

  return (
    <div className="dashboard">
      <h1>Мій Розумний Будинок</h1>
      
      <div className="devices-grid">
        {/* Проходимося по масиву пристроїв і малюємо карточку для кожного */}
        {devices.map((device) => (
          <div key={device.id} className="device-card">
            <h3>{device.name}</h3>
            <p><strong>Тип:</strong> {device.type}</p>
            <p><strong>Статус:</strong> {device.status}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App