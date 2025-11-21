// Simple Test Runner
function runTests() {
    console.log('Running Tests...');
    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${message}`);
            failed++;
        }
    }

    // T008: API URL Generation Test
    try {
        const url = generateApiUrl(35.6895, 139.6917, 7, 7);
        assert(url.includes('latitude=35.6895'), 'URL contains latitude');
        assert(url.includes('longitude=139.6917'), 'URL contains longitude');
        assert(url.includes('past_days=7'), 'URL contains past_days');
        assert(url.includes('forecast_days=7'), 'URL contains forecast_days');
        assert(url.includes('timezone=Asia/Tokyo'), 'URL contains timezone');
    } catch (e) {
        assert(false, `generateApiUrl threw error: ${e.message}`);
    }

    // T009: API Response Validation Test
    try {
        const validData = {
            hourly: {
                time: ['2023-01-01T00:00'],
                temperature_2m: [10.5]
            }
        };
        assert(validateWeatherData(validData) === true, 'Valid data returns true');

        const invalidData1 = {};
        assert(validateWeatherData(invalidData1) === false, 'Empty object returns false');

        const invalidData2 = { hourly: { time: [] } }; // Missing temp
        assert(validateWeatherData(invalidData2) === false, 'Missing temperature array returns false');

        const invalidData3 = { 
            hourly: { 
                time: ['A'], 
                temperature_2m: [1, 2] // Mismatch length
            } 
        };
        assert(validateWeatherData(invalidData3) === false, 'Mismatched array lengths returns false');
    } catch (e) {
        assert(false, `validateWeatherData threw error: ${e.message}`);
    }

    // T016: Celsius to Fahrenheit Conversion Test
    try {
        assert(celsiusToFahrenheit(0) === 32, '0°C is 32°F');
        assert(celsiusToFahrenheit(100) === 212, '100°C is 212°F');
        assert(celsiusToFahrenheit(-40) === -40, '-40°C is -40°F');
    } catch (e) {
        assert(false, `celsiusToFahrenheit threw error: ${e.message}`);
    }

    console.log(`Tests Completed: ${passed} Passed, ${failed} Failed`);
}

// Run tests if loaded
if (typeof window !== 'undefined') {
    // Wait for script.js to load functions
    window.addEventListener('load', runTests);
}
