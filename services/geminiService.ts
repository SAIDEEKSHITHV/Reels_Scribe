export const extractCaptionFromUrl = async (url: string): Promise<string> => {
  // Determine backend URL:
  // In development (Vite), we might be on localhost:3000 but server is on localhost:5000.
  // We need to fetch from localhost:5000.
  // In production (Render), we are on same domain, so relative path '/api/extract' works.

  const backendUrl = import.meta.env.DEV
    ? 'http://localhost:5000/api/extract'
    : '/api/extract';

  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.details || errData.error || 'Extraction failed on server');
    }

    const data = await response.json();
    return data.text;

  } catch (error: any) {
    console.error("Extraction Error:", error);
    throw new Error(error.message || "Failed to connect to extraction server.");
  }
};