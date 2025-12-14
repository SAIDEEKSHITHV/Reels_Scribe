
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

app.post('/api/extract', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const browser = await chromium.launch({
            headless: true
        });

        // Create a context with a realistic User-Agent
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        });

        const page = await context.newPage();

        // Go to URL
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Attempt to extract from Open Graph tags (most reliable for public previews)
        let caption = await page.evaluate(() => {
            const ogDescription = document.querySelector('meta[property="og:description"]');
            if (ogDescription) {
                return ogDescription.content;
            }
            // Fallback to title
            return document.title;
        });

        // Cleanup: OG Description often is "Username on Instagram: 'Caption...'"
        if (caption) {
            // Remove "Username on Instagram: " prefix if present
            caption = caption.replace(/^.*? on Instagram: ["']?|["']$/g, '');
            // Remove trailing " - Instagram" or similar if title fallback was used
            caption = caption.replace(/ - Instagram.*/, '');
        }

        await browser.close();

        if (!caption) {
            throw new Error('Could not extract caption content.');
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
