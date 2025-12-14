
import express from 'express';
import cors from 'cors';
import { chromium } from 'playwright-core';
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
export async function extractCaption(reelUrl) {
    const browser = await chromium.launch({
        executablePath: "/usr/bin/chromium",
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage"
        ]
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

app.post('/api/extract', async (req, res) => {
    const { url } = req.body;

    if (!url || !url.includes("instagram.com/reel")) {
        return res.status(400).json({
            success: false,
            message: "Invalid Instagram reel URL"
        });
    }

    try {
        const caption = await extractCaption(url);

        if (!caption) {
            return res.status(404).json({
                success: false,
                message: "Caption not found or reel is private"
            });
        }

        res.json({ success: true, caption });
    } catch (err) {
        console.error("EXTRACTION ERROR:", err.message);
        console.error(err.stack);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// Fallback for SPA routing: serve index.html for unknown routes
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
