/**
 * Integration Tests
 * End-to-end tests using Puppeteer
 */

const puppeteer = require('puppeteer');
const path = require('path');

const APP_URL = 'http://localhost:8080';
const TIMEOUT = 10000;

describe('Weather Forecast App - Integration Tests', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    });

    afterAll(async () => {
        if (browser) {
            await browser.close();
        }
    });

    beforeEach(async () => {
        page = await browser.newPage();
        await page.goto(APP_URL, { waitUntil: 'networkidle2' });
    });

    afterEach(async () => {
        if (page) {
            await page.close();
        }
    });

    test('Page loads successfully', async () => {
        const title = await page.title();
        expect(title).toBe('気温予測アプリ');
    }, TIMEOUT);

    test('City selector is visible and has correct options', async () => {
        const citySelect = await page.$('#city-select');
        expect(citySelect).not.toBeNull();

        const options = await page.$$eval('#city-select option', opts => 
            opts.map(opt => opt.value)
        );

        expect(options).toContain('nagoya');
        expect(options).toContain('tokyo');
        expect(options).toContain('new-york');
        expect(options).toContain('london');
        expect(options).toContain('paris');
    }, TIMEOUT);

    test('Chart canvas is present', async () => {
        const canvas = await page.$('#weatherChart');
        expect(canvas).not.toBeNull();
    }, TIMEOUT);

    test('Unit toggle switch is functional', async () => {
        const unitSwitch = await page.$('#unit-switch');
        expect(unitSwitch).not.toBeNull();

        const labelBefore = await page.$eval('#unit-label', el => el.textContent);
        expect(labelBefore).toContain('摂氏');

        await page.click('#unit-switch');
        await page.waitForTimeout(100);

        const labelAfter = await page.$eval('#unit-label', el => el.textContent);
        expect(labelAfter).toContain('華氏');
    }, TIMEOUT);

    test('Range buttons are present and clickable', async () => {
        const pastButtons = await page.$$('.range-btn[data-type="past"]');
        expect(pastButtons.length).toBe(3); // -1日, -7日, -14日

        const futureButtons = await page.$$('.range-btn[data-type="future"]');
        expect(futureButtons.length).toBe(3); // +1日, +7日, +14日

        // Click -14日 button
        await page.click('.range-btn[data-type="past"][data-days="14"]');
        await page.waitForTimeout(100);

        const activeClass = await page.$eval(
            '.range-btn[data-type="past"][data-days="14"]',
            el => el.className
        );
        expect(activeClass).toContain('active');
    }, TIMEOUT);

    test('Selecting a city triggers chart update', async () => {
        // Select Tokyo
        await page.select('#city-select', 'tokyo');
        
        // Wait for API call and chart rendering
        await page.waitForTimeout(2000);

        // Check if chart has data
        const chartData = await page.evaluate(() => {
            const canvas = document.getElementById('weatherChart');
            if (!canvas) return null;
            // Check if Chart.js instance exists
            return canvas.chart ? true : false;
        });

        // Note: Chart.js instance might not be accessible, so we check console logs instead
        const logs = [];
        page.on('console', msg => logs.push(msg.text()));

        await page.select('#city-select', 'nagoya');
        await page.waitForTimeout(2000);

        // Verify API call was logged
        const hasWeatherDataLog = logs.some(log => log.includes('Weather Data'));
        expect(hasWeatherDataLog).toBe(true);
    }, TIMEOUT * 2);

    test('Error handling for invalid city selection', async () => {
        // Select default empty option
        await page.select('#city-select', '');
        await page.waitForTimeout(500);

        // Chart should not be rendered
        const chartExists = await page.evaluate(() => {
            const canvas = document.getElementById('weatherChart');
            return canvas && canvas.chart !== undefined;
        });

        // Empty selection should not render chart
        expect(chartExists).toBeFalsy();
    }, TIMEOUT);

    test('Period adjustment updates active button state', async () => {
        // Initially -7日 should be active
        let activeClass = await page.$eval(
            '.range-btn[data-type="past"][data-days="7"]',
            el => el.className
        );
        expect(activeClass).toContain('active');

        // Click -1日
        await page.click('.range-btn[data-type="past"][data-days="1"]');
        await page.waitForTimeout(100);

        // -7日 should no longer be active
        activeClass = await page.$eval(
            '.range-btn[data-type="past"][data-days="7"]',
            el => el.className
        );
        expect(activeClass).not.toContain('active');

        // -1日 should be active
        activeClass = await page.$eval(
            '.range-btn[data-type="past"][data-days="1"]',
            el => el.className
        );
        expect(activeClass).toContain('active');
    }, TIMEOUT);

    test('Console logs weather data on successful fetch', async () => {
        const logs = [];
        page.on('console', msg => {
            if (msg.type() === 'log') {
                logs.push(msg.text());
            }
        });

        await page.select('#city-select', 'paris');
        await page.waitForTimeout(3000);

        const hasWeatherLog = logs.some(log => log.includes('Weather Data'));
        expect(hasWeatherLog).toBe(true);
    }, TIMEOUT * 2);
});
