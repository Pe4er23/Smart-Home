import { useState, useEffect } from 'react'
import ScenariosManager from './components/ScenariosManager';
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import './App.css'

// Настраиваем подключение к Laravel Reverb (WebSocket)
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
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('devices');

  const replaceDevice = (devicesList, updatedDevice) =>
    devicesList.map(dev => (dev.id === updatedDevice.id ? updatedDevice : dev));

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token); // Зберігаємо токен у браузері
        setToken(data.token);
      } else {
        alert('Невірний логін або пароль!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ЛОГІКА ВИХОДУ
  const handleLogout = async () => {
    if (token) {
      await fetch('http://127.0.0.1:8000/api/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
    }
    localStorage.removeItem('token');
    setToken('');
    setDevices([]); // Очищаємо дані пристроїв з екрану
  };

  useEffect(() => {
    // Якщо немає токена, зупиняємо завантаження і чекаємо логіна
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchDevices = async () => {
      try {
        // ДОДАЄМО ТОКЕН ДО ЗАПИТУ
        const response = await fetch('http://127.0.0.1:8000/api/devices', {
          headers: { 
            'Authorization': `Bearer ${token}`, 
            'Accept': 'application/json' 
          }
        });
        
        // Якщо токен застарів (Помилка 401)
        if (response.status === 401) {
            handleLogout();
            return;
        }

        const data = await response.json();
        setDevices(data);
        setLoading(false);
      } catch (error) {
        console.error("Помилка:", error);
        setLoading(false);
      }
    };
    fetchDevices();

    // Підписка на веб-сокети
    const channel = echo.channel('home-devices');
    channel.listen('.device.updated', (e) => {
      setDevices(prevDevices => replaceDevice(prevDevices, e.device));
    });

    return () => channel.stopListening('.device.updated');
  }, [token]); // Перезапускаємо `useEffect`, якщо токен зміниться

  // ОБОВ'ЯЗКОВО ДОДАЄМО ТОКЕН В УСІ ЗАПИТИ КЕРУВАННЯ
  const toggleDevice = async (id) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/devices/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
    } catch (error) { console.error("Помилка:", error); }
  };

  const updateDeviceState = (id, value) => {
    fetch(`http://127.0.0.1:8000/api/devices/${id}/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ value: value })
    }).catch(err => console.error("Помилка управління:", err));
  };

  let colorTimeout;
  const handleColorChange = (id, color) => {
    clearTimeout(colorTimeout);
    colorTimeout = setTimeout(() => { updateDeviceState(id, color); }, 300);
  };

  let sliderTimeout;
  const handleSliderChange = (id, value) => {
    setDevices(prev => prev.map(dev => dev.id === id ? { ...dev, status: value.toString() } : dev));
    clearTimeout(sliderTimeout);
    sliderTimeout = setTimeout(() => { updateDeviceState(id, value); }, 300);
  };

  const renderRelay = (device) => (
    <button
      className={`toggle-btn ${device.status === 'on' ? 'on' : 'off'}`}
      onClick={() => toggleDevice(device.id)}
    >
      {device.status === 'on' ? 'Увімкнено' : 'Вимкнено'}
    </button>
  );

  const renderRgbLamp = (device) => {
    const isLedOff = device.status === '#000000' || device.status === 'off';
    return (
      <div style={{ width: '100%', textAlign: 'center', marginTop: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
          <button
            onClick={() => updateDeviceState(device.id, '#ffffff')}
            className={`control-btn led-on ${isLedOff ? '' : 'active-cmd'}`}
            disabled={!isLedOff}
            style={{ fontSize: '12px' }}
          >
            Увімкн.
          </button>
          <button
            onClick={() => updateDeviceState(device.id, 'off')}
            className={`control-btn led-off ${isLedOff ? 'active-cmd' : ''}`}
            disabled={isLedOff}
            style={{ fontSize: '12px' }}
          >
            Вимкн.
          </button>
        </div>
        <p style={{ marginBottom: '5px', fontSize: '12px', color: '#666' }}>Колір:</p>
        <input
          type="color"
          value={device.status?.startsWith('#') ? device.status : '#ffffff'}
          onChange={(e) => handleColorChange(device.id, e.target.value)}
          disabled={isLedOff}
          style={{ width: '100px', height: '35px', cursor: isLedOff ? 'not-allowed' : 'pointer', border: 'none', borderRadius: '8px', opacity: isLedOff ? 0.5 : 1 }}
        />
      </div>
    );
  };

  const renderThermostat = (device) => {
    const currentTemp = Number.parseInt(device.status) || 22;
    return (
      <div className="thermostat-container">
        <button onClick={() => updateDeviceState(device.id, currentTemp - 1)} className="control-btn">-</button>
        <span className="thermostat-temp">{currentTemp}°C</span>
        <button onClick={() => updateDeviceState(device.id, currentTemp + 1)} className="control-btn">+</button>
      </div>
    );
  };

  const renderBlinds = (device) => {
    const blindsPos = Number.parseInt(device.status) || 0;
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
          onChange={(e) => handleSliderChange(device.id, e.target.value)}
          className="blinds-slider"
        />

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button
            onClick={() => updateDeviceState(device.id, 100)}
            className={`control-btn ${isFullyOpen ? 'active-cmd' : ''}`}
            disabled={isFullyOpen}
            style={{ backgroundColor: '#10ad79' }}
          >
            Відкрити
          </button>

          <button
            onClick={() => updateDeviceState(device.id, 0)}
            className={`control-btn ${isFullyClosed ? 'active-cmd' : ''}`}
            disabled={isFullyClosed}
            style={{ backgroundColor: '#d43f3f' }}
          >
            Закрити
          </button>
        </div>
      </div>
    );
  };

  const renderLock = (device) => {
    const isLocked = device.status === 'locked';
    return (
      <div className="lock-container">
        <p className="lock-status">Статус: {isLocked ? 'Заблоковано' : 'Розблоковано'}</p>
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
    );
  };

  const renderVacuum = (device) => {
    const isCleaning = device.status === 'start';
    const isDocked = device.status === 'dock';

    return (
      <div className="vacuum-container">
        <p className="vacuum-status">
          Поточний стан: <span className={isCleaning ? 'vacuum-cleaning' : 'vacuum-docked'}>{isCleaning ? 'Прибирає' : 'На базі'}</span>
        </p>

        <div className="vacuum-controls">
          <button
            onClick={() => updateDeviceState(device.id, 'start')}
            className={`control-btn vacuum-btn-start ${isCleaning ? 'active-cmd' : ''}`}
            disabled={isCleaning}
          >
            ▶ Старт
          </button>
          <button
            onClick={() => updateDeviceState(device.id, 'dock')}
            className={`control-btn vacuum-btn-dock ${isDocked ? 'active-cmd' : ''}`}
            disabled={isDocked}
          >
            🏠 На базу
          </button>
        </div>
      </div>
    );
  };

  const renderSecuritySensor = (device) => {
    const isTriggered = device.status === 'triggered';
    return (
      <p className={`security-sensor-status ${isTriggered ? 'alert' : 'safe'}`}>
        {isTriggered ? '🚨 ТРИВОГА! Рух' : '✅ Спокійно'}
      </p>
    );
  };

  const renderSensorDefault = (device) => (
    <p className="default-sensor">
      <strong>Поточний показник:</strong> <span className="default-sensor-value">{device.status}°C</span>
    </p>
  );

  // ФУНКЦІЯ-МАРШРУТИЗАТОР: Визначає, який інтерфейс малювати залежно від типу пристрою
  const renderDeviceControl = (device) => {
    switch (device.type) {
      case 'relay':
        return renderRelay(device);
      case 'rgb_lamp':
        return renderRgbLamp(device);
      case 'thermostat':
        return renderThermostat(device);
      case 'blinds':
        return renderBlinds(device);
      case 'lock':
        return renderLock(device);
      case 'vacuum':
        return renderVacuum(device);
      case 'security_sensor':
        return renderSecuritySensor(device);
      case 'sensor':
      default:
        return renderSensorDefault(device);
    }
  };

  if (loading) return <div className="loading-screen">Завантаження...</div>

  // МАЛЮЄМО ЕКРАН ВХОДУ, ЯКЩО НЕМАЄ ТОКЕНА
  if (!token) {
    return (
        <div className="login-container">
            <form onSubmit={handleLogin} className="login-form">
                <h2 className="login-title">Вхід у Smart Home</h2>
                <p className="login-subtitle">Введіть дані доступу</p>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="login-input" required />
                <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} className="login-input" required />
                <button type="submit" className="control-btn login-btn-submit">Увійти</button>
            </form>
        </div>
    );
  }

  // МАЛЮЄМО ГОЛОВНИЙ ЕКРАН (якщо токен є)
  return (
    <div className="dashboard">
      {/* Шапка з кнопкою виходу */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Smart Home</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Вийти
        </button>
      </div>
      
      {/* Вкладки */}
      <div className="tabs-container">
        <button onClick={() => setActiveTab('devices')} className={`tab-btn ${activeTab === 'devices' ? 'active' : 'inactive'}`}>
          Пристрої
        </button>
        <button onClick={() => setActiveTab('scenarios')} className={`tab-btn ${activeTab === 'scenarios' ? 'active' : 'inactive'}`}>
          Автоматизація
        </button>
      </div>

      {activeTab === 'devices' ? (
        <div className="devices-grid">
          {devices.map(device => (
            <div key={device.id} className="device-card">
              <h3>{device.name}</h3>
              <p className="device-type-label">Тип: {device.type}</p>
              {renderDeviceControl(device)}
            </div>
          ))}
        </div>
      ) : (
        // ПЕРЕДАЄМО ТОКЕН У СЦЕНАРІЇ!
        <ScenariosManager devices={devices} token={token} /> 
      )}
    </div>
  );
}

export default App