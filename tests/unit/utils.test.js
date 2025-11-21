/**
 * Unit Tests for Utility Functions
 * Tests for temperature conversion and data validation
 */

// Mock functions from script.js
function celsiusToFahrenheit(celsius) {
    return (celsius * 9 / 5) + 32;
}

function validateWeatherData(data) {
    if (!data || typeof data !== 'object') return false;
    if (!data.hourly || !Array.isArray(data.hourly.time) || !Array.isArray(data.hourly.temperature_2m)) return false;
    if (data.hourly.time.length !== data.hourly.temperature_2m.length) return false;
    return true;
}

function generateApiUrl(lat, lon, past, future) {
    const timezone = 'Asia/Tokyo';
    return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&timezone=${timezone}&past_days=${past}&forecast_days=${future}`;
}

describe('celsiusToFahrenheit', () => {
    test('converts 0°C to 32°F', () => {
        expect(celsiusToFahrenheit(0)).toBe(32);
    });

    test('converts 100°C to 212°F', () => {
        expect(celsiusToFahrenheit(100)).toBe(212);
    });

    test('converts -40°C to -40°F', () => {
        expect(celsiusToFahrenheit(-40)).toBe(-40);
    });

    test('converts 20°C to 68°F', () => {
        expect(celsiusToFahrenheit(20)).toBe(68);
    });

    test('handles decimal values correctly', () => {
        expect(celsiusToFahrenheit(25.5)).toBeCloseTo(77.9, 1);
    });
});

describe('validateWeatherData', () => {
    test('validates correct data structure', () => {
        const validData = {
            hourly: {
                time: ['2025-11-25T00:00', '2025-11-25T01:00'],
                temperature_2m: [12.5, 13.0]
            }
        };
        expect(validateWeatherData(validData)).toBe(true);
    });

    test('rejects null data', () => {
        expect(validateWeatherData(null)).toBe(false);
    });

    test('rejects undefined data', () => {
        expect(validateWeatherData(undefined)).toBe(false);
    });

    test('rejects data without hourly field', () => {
        const invalidData = { other: 'field' };
        expect(validateWeatherData(invalidData)).toBe(false);
    });

    test('rejects data with non-array time', () => {
        const invalidData = {
            hourly: {
                time: 'not-an-array',
                temperature_2m: [12.5]
            }
        };
        expect(validateWeatherData(invalidData)).toBe(false);
    });

    test('rejects data with non-array temperature', () => {
        const invalidData = {
            hourly: {
                time: ['2025-11-25T00:00'],
                temperature_2m: 'not-an-array'
            }
        };
        expect(validateWeatherData(invalidData)).toBe(false);
    });

    test('rejects data with mismatched array lengths', () => {
        const invalidData = {
            hourly: {
                time: ['2025-11-25T00:00', '2025-11-25T01:00'],
                temperature_2m: [12.5] // Length mismatch
            }
        };
        expect(validateWeatherData(invalidData)).toBe(false);
    });

    test('validates empty arrays (edge case)', () => {
        const edgeCaseData = {
            hourly: {
                time: [],
                temperature_2m: []
            }
        };
        expect(validateWeatherData(edgeCaseData)).toBe(true);
    });
});

describe('generateApiUrl', () => {
    test('generates correct URL for Tokyo with default range', () => {
        const url = generateApiUrl(35.6895, 139.6917, 7, 7);
        expect(url).toBe('https://api.open-meteo.com/v1/forecast?latitude=35.6895&longitude=139.6917&hourly=temperature_2m&timezone=Asia/Tokyo&past_days=7&forecast_days=7');
    });

    test('generates correct URL for negative coordinates', () => {
        const url = generateApiUrl(-33.8688, 151.2093, 1, 1);
        expect(url).toBe('https://api.open-meteo.com/v1/forecast?latitude=-33.8688&longitude=151.2093&hourly=temperature_2m&timezone=Asia/Tokyo&past_days=1&forecast_days=1');
    });

    test('handles 14-day range', () => {
        const url = generateApiUrl(40.7128, -74.0060, 14, 14);
        expect(url).toContain('past_days=14');
        expect(url).toContain('forecast_days=14');
    });

    test('URL contains required parameters', () => {
        const url = generateApiUrl(51.5074, -0.1278, 7, 7);
        expect(url).toContain('latitude=');
        expect(url).toContain('longitude=');
        expect(url).toContain('hourly=temperature_2m');
        expect(url).toContain('timezone=Asia/Tokyo');
        expect(url).toContain('past_days=');
        expect(url).toContain('forecast_days=');
    });
});
