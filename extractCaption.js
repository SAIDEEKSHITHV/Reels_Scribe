
import { chromium } from 'playwright';

// Helper function for extraction (User provided logic)
export async function extractCaption(reelUrl) {
    const browser = await chromium.launch({
        headless: true
    });

    const page = await browser.newPage();

    await page.goto(reelUrl, {
        waitUntil: "networkidle",
        timeout: 60000
    });

    await page.waitForTimeout(3000);

    const caption = await page.evaluate(() => {
        const scripts = document.querySelectorAll(
            "script[type='application/ld+json']"
        );

        for (const script of scripts) {
            try {
                const data = JSON.parse(script.innerText);
                if (data.caption) return data.caption;
            } catch { }
        }
        return null;
    });

    await browser.close();
    return caption;
}
