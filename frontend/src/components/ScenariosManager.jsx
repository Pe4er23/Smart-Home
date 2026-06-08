import { useState, useEffect } from 'react';

export default function ScenariosManager({ devices, token }) {
    const [scenarios, setScenarios] = useState([]);
    const [formData, setFormData] = useState({
        name: '', trigger_device_id: '', condition: '=', trigger_value: '', action_device_id: '', action_value: ''
    });

    const fetchScenarios = () => {
        fetch('http://127.0.0.1:8000/api/scenarios', {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    })
            .then(res => res.json())
            .then(data => setScenarios(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchScenarios();
    }, []);

    // Розумна підстановка значень за замовчуванням при зміні пристрою
    const handleDeviceChange = (fieldPrefix, deviceId) => {
        const device = devices.find(d => d.id === Number.parseInt(deviceId));
        let defaultValue = '';
        
        if (device) {
            switch(device.type) {
                case 'lock': defaultValue = 'locked'; break;
                case 'relay': defaultValue = 'on'; break;
                case 'vacuum': defaultValue = 'start'; break;
                case 'security_sensor': defaultValue = 'triggered'; break;
                case 'thermostat': defaultValue = '20'; break;
                case 'blinds': defaultValue = '0'; break;
                case 'rgb_lamp': defaultValue = '#ffffff'; break;
                default: defaultValue = '';
            }
        }
        
        setFormData(prev => ({
            ...prev,
            [`${fieldPrefix}_device_id`]: deviceId,
            [`${fieldPrefix}_value`]: defaultValue
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch('http://127.0.0.1:8000/api/scenarios', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}` // ДОБАВЛЕН ТОКЕН
            },
            body: JSON.stringify(formData)
        }).then(() => {
            fetchScenarios();
            setFormData({name: '', trigger_device_id: '', condition: '=', trigger_value: '', action_device_id: '', action_value: ''});
        }).catch(err => console.error("Помилка створення:", err));
    };

    const deleteScenario = (id) => {
        fetch(`http://127.0.0.1:8000/api/scenarios/${id}`, { 
            method: 'DELETE',
            headers: { 
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}` // ДОБАВЛЕН ТОКЕН
            }
        })
        .then(() => fetchScenarios())
        .catch(err => console.error("Помилка видалення:", err));
    };

    // ГЕНЕРАТОР ДИНАМІЧНИХ ПОЛІВ: Малює правильний інтерфейс залежно від типу пристрою
    const renderDynamicInput = (fieldPrefix) => {
        const deviceId = formData[`${fieldPrefix}_device_id`];
        const valueKey = `${fieldPrefix}_value`;
        const currentValue = formData[valueKey];
        const updateValue = (val) => setFormData(prev => ({ ...prev, [valueKey]: val.toString() }));

        const device = devices.find(d => d.id === Number.parseInt(deviceId));
        
        // Якщо пристрій ще не обрано
        if (!device) return <input placeholder="Спочатку оберіть пристрій..." disabled style={inputStyle} />;

        // Малюємо інтерфейс залежно від типу
        switch (device.type) {
            case 'lock':
                return (
                    <select value={currentValue} onChange={e => updateValue(e.target.value)} style={inputStyle}>
                        <option value="locked">Заблоковано</option>
                        <option value="unlocked">Розблоковано</option>
                    </select>
                );
            case 'relay':
                return (
                    <select value={currentValue} onChange={e => updateValue(e.target.value)} style={inputStyle}>
                        <option value="on">Увімкнено (ON)</option>
                        <option value="off">Вимкнено (OFF)</option>
                    </select>
                );
            case 'vacuum':
                return (
                    <select value={currentValue} onChange={e => updateValue(e.target.value)} style={inputStyle}>
                        <option value="start">▶ Старт</option>
                        <option value="dock">🏠 На базу</option>
                    </select>
                );
            case 'security_sensor':
                 return (
                    <select value={currentValue} onChange={e => updateValue(e.target.value)} style={inputStyle}>
                        <option value="triggered">🚨 Тривога</option>
                        <option value="safe">✅ Спокійно</option>
                    </select>
                 );
            case 'thermostat': // Кондиціонер / Термостат
                { const temp = Number.parseInt(currentValue) || 20;
                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#181a1b', padding: '0 10px', borderRadius: '6px', border: '1px solid #414141', flex: 1 }}>
                        <button type="button" onClick={() => updateValue(temp - 1)} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '20px', cursor: 'pointer', padding: '0 10px' }}>-</button>
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>{temp}°C</span>
                        <button type="button" onClick={() => updateValue(temp + 1)} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '20px', cursor: 'pointer', padding: '0 10px' }}>+</button>
                    </div>
                ); }
            case 'blinds': // Штори
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#181a1b', padding: '0 10px', borderRadius: '6px', border: '1px solid #414141', flex: 1 }}>
                        <input type="range" min="0" max="100" value={currentValue || 0} onChange={e => updateValue(e.target.value)} style={{ flex: 1 }} />
                        <span style={{ color: '#fff', fontSize: '12px', minWidth: '30px' }}>{currentValue || 0}%</span>
                    </div>
                );
            case 'rgb_lamp': // LED Стрічка
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#181a1b', padding: '0 5px', borderRadius: '6px', border: '1px solid #414141', flex: 1 }}>
                        <select value={currentValue === 'off' ? 'off' : 'color'} onChange={e => updateValue(e.target.value === 'off' ? 'off' : '#ffffff')} style={{...inputStyle, border: 'none', padding: '4px'}}>
                            <option value="color">Світить колір</option>
                            <option value="off">Вимкнено</option>
                        </select>
                        {currentValue !== 'off' && (
                            <input type="color" value={currentValue?.startsWith('#') ? currentValue : '#ffffff'} onChange={e => updateValue(e.target.value)} style={{ border: 'none', width: '30px', height: '26px', cursor: 'pointer', background: 'transparent', padding: 0 }} />
                        )}
                    </div>
                );
            default: // Звичайні датчики (Температура тощо)
                return <input placeholder="Введіть число..." type="number" step="0.1" value={currentValue} onChange={e => updateValue(e.target.value)} style={inputStyle} required />;
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', color: '#c8c3bc' }}>
            <div className="device-card" style={{ marginBottom: '30px', alignItems: 'stretch' }}>
                <h2 style={{ color: '#aec2d3', marginTop: 0 }}>Створити нову автоматизацію</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    <input 
                        placeholder="Назва сценарію (напр. Увімкнути світло при відкритті дверей)" 
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #414141', background: '#1a2422', color: '#fff' }} required
                    />

                    <div style={{ padding: '15px', background: '#1a2422', borderRadius: '8px', border: '1px solid #414141' }}>
                        <strong style={{ color: '#3b82f6' }}>ЯКЩО (Тригер):</strong>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <select value={formData.trigger_device_id} onChange={e => handleDeviceChange('trigger', e.target.value)} style={inputStyle} required>
                                <option value="">Оберіть пристрій...</option>
                                {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            
                            <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} style={{...inputStyle, width: '60px', flex: 'none'}}>
                                <option value="=">=</option>
                                <option value=">">&gt;</option>
                                <option value="<">&lt;</option>
                            </select>
                            
                            {/* Викликаємо наш динамічний генератор інтерфейсу */}
                            {renderDynamicInput('trigger')}
                        </div>
                    </div>

                    <div style={{ padding: '15px', background: '#1a2422', borderRadius: '8px', border: '1px solid #414141' }}>
                        <strong style={{ color: '#1ebb57' }}>ТОДІ (Дія):</strong>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <select value={formData.action_device_id} onChange={e => handleDeviceChange('action', e.target.value)} style={inputStyle} required>
                                <option value="">Оберіть пристрій...</option>
                                {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            
                            {/* Викликаємо той самий генератор для дії */}
                            {renderDynamicInput('action')}
                        </div>
                    </div>

                    <button type="submit" className="control-btn" style={{ background: '#3b82f6', marginTop: '10px' }}>Зберегти сценарій</button>
                </form>
            </div>

            <h3 style={{ color: '#aec2d3' }}>Активні сценарії:</h3>
            {scenarios.length === 0 && <p>Немає створених сценаріїв.</p>}
            {Array.isArray(scenarios) ? (
                scenarios.map(sc => (
                    <div key={sc.id} style={{ background: '#181a1b', border: '1px solid #414141', padding: '15px', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <strong style={{ fontSize: '18px', color: '#fff' }}>{sc.name}</strong>
                            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#888' }}>
                                Якщо <span style={{color: '#3b82f6'}}>{sc.trigger_device?.name}</span> {sc.condition} <b>{sc.trigger_value}</b> ➔ Тоді <span style={{color: '#1ebb57'}}>{sc.action_device?.name}</span> = <b>{sc.action_value}</b>
                            </p>
                        </div>
                        <button onClick={() => deleteScenario(sc.id)} style={{ background: '#ad1616', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>Видалити</button>
                    </div>
                ))
            ) : (
                <p>Помилка завантаження сценаріїв з сервера.</p>
            )}
        </div>
    );
}

const inputStyle = {
    padding: '8px', borderRadius: '6px', border: '1px solid #414141', background: '#181a1b', color: '#fff', flex: 1, minHeight: '38px'
};