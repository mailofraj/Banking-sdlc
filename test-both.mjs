import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 800 });

// Screenshot Demo Bank (port 3000)
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'C:\\Temp\\app-3000-login.png' });
console.log('Port 3000 title:', await page.title());

// Log in to see dashboard
await page.fill('input[type="text"]', 'admin');
await page.fill('input[type="password"]', 'admin');
await page.click('button[type="submit"]');
await page.waitForTimeout(1500);
await page.screenshot({ path: 'C:\\Temp\\app-3000-dashboard.png', fullPage: true });
console.log('Port 3000 dashboard heading:', await page.textContent('h2').catch(() => 'n/a'));

// Screenshot SDLC Dashboard (port 3001)
await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'C:\\Temp\\app-3001-sdlc.png', fullPage: true });
console.log('Port 3001 title:', await page.title());

await browser.close();
console.log('Done.');
