
import express from 'express';
import cors from 'cors';
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files from the 'dist' directory (Vite build)
app.use(express.static(path.join(__dirname, 'dist')));

// Helper function for extraction (User provided logic)
async function extractCaption(reelUrl) {
    const browser = await chromium.launch({
        headless: true
    });

    const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    });

    const page = await context.newPage();

    try {
        await page.goto(reelUrl, {
            waitUntil: "networkidle",
            timeout: 60000
        });

        // wait for Instagram to fully load caption
        await page.waitForTimeout(3000);

        const caption = await page.evaluate(() => {
            const scripts = document.querySelectorAll("script[type='application/ld+json']");

            for (const script of scripts) {
                try {
                    const data = JSON.parse(script.innerText);
                    if (data.caption) return data.caption;
                    // Sometimes it's nested in invalid JSON or different structure, 
                    // but legal JSON-LD for Instagram usually has 'caption' or 'articleBody'
                    if (data.articleBody) return data.articleBody;
                } catch (e) { }
            }
            return null;
        });

        await browser.close();
        return caption;

    } catch (e) {
        await browser.close();
        throw e;
    }
}

app.post('/api/extract', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        console.log(`Extracting caption for: ${url}`);
        const caption = await extractCaption(url);

        if (!caption) {
            throw new Error('Could not extract caption content (Not found in JSON-LD).');
        }

        res.json({ text: caption });

    } catch (error) {
        console.error('Playwright Extraction Error:', error);
        res.status(500).json({ error: 'Failed to extract caption', details: error.message });
    }
});

// Fallback for SPA routing: serve index.html for unknown routes
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
