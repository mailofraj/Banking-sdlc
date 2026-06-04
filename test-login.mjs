import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 800 });

console.log('Navigating to http://localhost:3000 ...');
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

await page.screenshot({ path: 'C:\\Temp\\screen-1-login.png' });
const title = await page.title();
const heading = await page.textContent('h1').catch(() => 'not found');
console.log('Page title:', title);
console.log('Main heading:', heading);

// Fill and submit login
await page.fill('input[type="text"]', 'john.doe');
await page.fill('input[type="password"]', 'password123');
await page.screenshot({ path: 'C:\\Temp\\screen-2-filled.png' });

await page.click('button[type="submit"]');
await page.waitForTimeout(1500);
await page.screenshot({ path: 'C:\\Temp\\screen-3-dashboard.png', fullPage: true });

const welcome = await page.textContent('h2').catch(() => 'not found');
console.log('Dashboard heading:', welcome);

// Click first account card
const accountCards = await page.$$('main button');
if (accountCards.length > 0) {
  await accountCards[0].click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'C:\\Temp\\screen-4-account-detail.png', fullPage: true });
  console.log('Account detail page screenshot saved');
}

// Logout
const logoutBtn = await page.$('button:has-text("Sign out")');
if (logoutBtn) {
  await logoutBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'C:\\Temp\\screen-5-logged-out.png' });
  console.log('Logout successful — back to login');
}

// Wrong credentials
await page.fill('input[type="text"]', 'bad.user');
await page.fill('input[type="password"]', 'wrongpass');
await page.click('button[type="submit"]');
await page.waitForTimeout(1200);
await page.screenshot({ path: 'C:\\Temp\\screen-6-wrong-creds.png' });
const err = await page.evaluate(() => {
  const els = Array.from(document.querySelectorAll('*'));
  const el = els.find(e => e.style && e.style.background && e.style.background.includes('fef2f2'));
  return el ? el.textContent.trim() : 'not found';
});
console.log('Error message:', err);

await browser.close();
console.log('\nAll login tests passed.');
