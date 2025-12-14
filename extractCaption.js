
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

    if (page.url().includes("login")) {
        throw new Error("Instagram redirected to login page");
    }

    await page.waitForTimeout(5000);

    const caption = await page.evaluate(() => {
        // 1️⃣ Try JSON-LD (best case)
        const scripts = document.querySelectorAll(
            "script[type='application/ld+json']"
        );

        for (const script of scripts) {
            try {
                const data = JSON.parse(script.innerText);
                if (data.caption && data.caption.length > 0) {
                    return data.caption;
                }
            } catch { }
        }

        // 2️⃣ Try meta description (fallback)
        const metaDesc = document.querySelector(
            'meta[property="og:description"]'
        );
        if (metaDesc && metaDesc.content) {
            // Remove username prefix
            const content = metaDesc.content;
            const idx = content.indexOf(":");
            if (idx !== -1) {
                return content.slice(idx + 1).trim();
            }
        }

        // 3️⃣ Try visible text spans (last resort)
        const spans = Array.from(document.querySelectorAll("span"));

        const longTexts = spans
            .map(s => s.innerText)
            .filter(
                text =>
                    text &&
                    text.length > 30 &&
                    !text.includes("Log in") &&
                    !text.includes("Sign up")
            );

        if (longTexts.length > 0) {
            return longTexts[0];
        }

        return null;
    });

    await browser.close();
    return caption;
}
