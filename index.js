
import express from 'express';
import cors from 'cors';
import { extractCaption } from './extractCaption.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve a simple message for the root route
app.get('/', (req, res) => {
    res.send('ReelScribe Backend is Running! Use POST /api/extract to extract captions.');
});

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



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
