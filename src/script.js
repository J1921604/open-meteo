// Constants (T007)
const CITY_COORDINATES = {
    'tokyo': { lat: 35.6895, lon: 139.6917, name: 'Tokyo' },
    'nagoya': { lat: 35.1815, lon: 136.9066, name: 'Nagoya' },
    'osaka': { lat: 34.6937, lon: 135.5023, name: 'Osaka' },
    'fukuoka': { lat: 33.5904, lon: 130.4017, name: 'Fukuoka' },
    'sapporo': { lat: 43.0642, lon: 141.3469, name: 'Sapporo' },
    'new-york': { lat: 40.7128, lon: -74.0060, name: 'New York' },
    'london': { lat: 51.5074, lon: -0.1278, name: 'London' },
    'paris': { lat: 48.8566, lon: 2.3522, name: 'Paris' },
    'sydney': { lat: -33.8688, lon: 151.2093, name: 'Sydney' },
    'singapore': { lat: 1.3521, lon: 103.8198, name: 'Singapore' },
    'dubai': { lat: 25.2048, lon: 55.2708, name: 'Dubai' },
    'toronto': { lat: 43.6532, lon: -79.3832, name: 'Toronto' }
};

// DOM Elements
const citySelect = document.getElementById('city-select');
const unitSwitch = document.getElementById('unit-switch');
const rangeButtons = document.querySelectorAll('.range-btn');
const ctx = document.getElementById('weatherChart').getContext('2d');

// State
let currentCityId = null;
let isFahrenheit = false;
let pastDays = 7;
let futureDays = 7;
let chart = null;
let weatherData = null;

// Logic Functions (Testable)

// T008: API URL Generation
function generateApiUrl(lat, lon, past, future) {
    const timezone = 'Asia/Tokyo';
    return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&timezone=${timezone}&past_days=${past}&forecast_days=${future}`;
}

// T009: API Response Validation
function validateWeatherData(data) {
    if (!data || typeof data !== 'object') return false;
    if (!data.hourly || !Array.isArray(data.hourly.time) || !Array.isArray(data.hourly.temperature_2m)) return false;
    if (data.hourly.time.length !== data.hourly.temperature_2m.length) return false;
    return true;
}

// T016: Celsius to Fahrenheit Conversion
function celsiusToFahrenheit(celsius) {
    return (celsius * 9 / 5) + 32;
}

// Event Listeners
citySelect.addEventListener('change', (e) => {
    const cityId = e.target.value;
    if (cityId && CITY_COORDINATES[cityId]) {
        currentCityId = cityId;
        fetchWeatherData();
    } else {
        currentCityId = null;
        if (chart) chart.destroy();
    }
});

unitSwitch.addEventListener('change', (e) => {
    isFahrenheit = e.target.checked;
    document.getElementById('unit-label').textContent = isFahrenheit ? '華氏 (°F)' : '摂氏 (°C)';
    if (weatherData) updateChart();
});

rangeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const type = e.target.dataset.type;
        const days = parseInt(e.target.dataset.days);
        
        // Update active state
        document.querySelectorAll(`.range-btn[data-type="${type}"]`).forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        if (type === 'past') pastDays = days;
        if (type === 'future') futureDays = days;

        if (currentCityId) fetchWeatherData();
    });
});

// Set default active buttons
document.querySelector('.range-btn[data-type="past"][data-days="7"]').classList.add('active');
document.querySelector('.range-btn[data-type="future"][data-days="7"]').classList.add('active');

async function fetchWeatherData() {
    if (!currentCityId) return;

    const city = CITY_COORDINATES[currentCityId];
    const url = generateApiUrl(city.lat, city.lon, pastDays, futureDays);

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        
        if (!validateWeatherData(data)) {
            throw new Error('Invalid Data Format');
        }

        console.log('Weather Data:', data); // Requirement: Log to console
        weatherData = data;
        updateChart();
    } catch (error) {
        console.error('Fetch error:', error);
        alert('天気データの取得に失敗しました。');
    }
}

function updateChart() {
    if (!weatherData) return;

    const hourly = weatherData.hourly;
    const times = hourly.time.map(t => {
        const date = new Date(t);
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
    });
    
    let temps = hourly.temperature_2m;

    if (isFahrenheit) {
        temps = temps.map(c => celsiusToFahrenheit(c));
    }

    // Separate past and future data for styling
    const now = new Date();
    const nowIndex = hourly.time.findIndex(t => new Date(t) > now);

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: times,
            datasets: [
                {
                    label: `気温 ${isFahrenheit ? '(°F)' : '(°C)'}`,
                    data: temps,
                    borderColor: '#00ff41', // Neon Green
                    backgroundColor: 'rgba(0, 255, 65, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4,
                    segment: {
                        borderColor: ctx => {
                            const index = ctx.p0DataIndex;
                            return index >= nowIndex ? '#ff00ff' : '#00ff41';
                        },
                        borderDash: ctx => {
                            const index = ctx.p0DataIndex;
                            return index >= nowIndex ? [6, 6] : [];
                        }
                    }
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index',
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        generateLabels: function(chart) {
                            return [
                                {
                                    text: `実績 ${isFahrenheit ? '(°F)' : '(°C)'}`,
                                    fillStyle: '#00ff41',
                                    strokeStyle: '#00ff41',
                                    lineWidth: 2,
                                    hidden: false,
                                    index: 0,
                                    fontColor: '#00ff41'
                                },
                                {
                                    text: `予測 ${isFahrenheit ? '(°F)' : '(°C)'}`,
                                    fillStyle: '#ff00ff',
                                    strokeStyle: '#ff00ff',
                                    lineWidth: 2,
                                    lineDash: [6, 6],
                                    hidden: false,
                                    index: 1,
                                    fontColor: '#ff00ff'
                                }
                            ];
                        },
                        font: {
                            size: 14,
                            family: "'Courier New', monospace"
                        },
                        padding: 10,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 20, 30, 0.9)',
                    titleColor: '#00ff41',
                    bodyColor: '#fff',
                    borderColor: '#00ff41',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: {
                        color: '#333'
                    },
                    ticks: {
                        color: '#00ff41',
                        maxTicksLimit: 10
                    }
                },
                y: {
                    grid: {
                        color: '#333',
                        stepSize: 1 // 1 degree interval
                    },
                    ticks: {
                        color: '#00ff41'
                    }
                }
            }
        }
    });
}
