import { useState, useEffect } from "react";
import "./CryptoPrices.css";

const CryptoPrices = () => {
  const [prices, setPrices] = useState(null);
  const [goldPrices, setGoldPrices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd"
      );
      const data = await response.json();
      setPrices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

 const fetchGold = async () => {
  try {
    const response = await fetch(
      "https://corsproxy.io/?url=https://query1.finance.yahoo.com/v8/finance/chart/GC=F"
    );
    const data = await response.json();
    const goldUSD = data.chart.result[0].meta.regularMarketPrice;
    const goldAED = (goldUSD * 3.67).toFixed(2);

    setGoldPrices({
      usd: goldUSD.toLocaleString(),
      aed: parseFloat(goldAED).toLocaleString()
    });
  } catch (err) {
    console.error("Gold fetch error:", err);
  }
};

  useEffect(() => {
    fetchPrices();
    fetchGold();

    const interval = setInterval(() => {
      fetchPrices();
      fetchGold(); // ✅ refresh gold too every 60s
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="loading">Loading prices...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="crypto-container">
      <h2 className="crypto-title">Live Crypto Prices</h2>

      <div className="crypto-grid">

        {/* LEFT SIDE - Crypto Prices */}
        <div className="crypto-left">
          <div className="crypto-card">
            <span className="crypto-name">Bitcoin</span>
            <span className="crypto-price">${prices?.bitcoin?.usd.toLocaleString()}</span>
          </div>
          <div className="crypto-card">
            <span className="crypto-name">Ethereum</span>
            <span className="crypto-price">${prices?.ethereum?.usd.toLocaleString()}</span>
          </div>
          <div className="crypto-card">
            <span className="crypto-name">Solana</span>
            <span className="crypto-price">${prices?.solana?.usd.toLocaleString()}</span>
          </div>
        </div>

        {/* RIGHT SIDE - Gold */}
        <div className="crypto-right">
          <div className="crypto-card">
            <span className="crypto-name">🥇 Gold (per oz)</span>
            <div className="gold-prices">
              <span className="crypto-price">${goldPrices?.usd ?? "Loading..."}</span>
              <span className="crypto-price-aed">AED {goldPrices?.aed ?? "Loading..."}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CryptoPrices;