// This serverless function fetches real stock data from Alpha Vantage
export default async function handler(req, res) {
    // Enable CORS so your website can call this function
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    // Get the stock symbol from the URL (e.g., ?symbol=RY.TO)
    const { symbol } = req.query;

    // Your API key (stored securely in Vercel environment variables)
    const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

    if (!symbol) {
        return res.status(400).json({ error: 'Please provide a stock symbol' });
    }

    if (!API_KEY) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        // Fetch real stock data from Alpha Vantage
        const response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
        );

        const data = await response.json();

        // Check if we got valid data
        if (data['Global Quote']) {
            const quote = data['Global Quote'];

            // Format the data nicely
            const stockData = {
                symbol: quote['01. symbol'],
                price: parseFloat(quote['05. price']),
                change: parseFloat(quote['09. change']),
                changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
                volume: parseInt(quote['06. volume']),
                lastUpdated: quote['07. latest trading day']
            };

            return res.status(200).json(stockData);
        } else {
            return res.status(404).json({ error: 'Stock not found or API limit reached' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch stock data' });
    }
}
