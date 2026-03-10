import { useState, useEffect } from "react";
import "./CryptoPrices.css";

const CryptoPrices = () => {
  const [prices, setPrices] = useState(null);
  const [goldPrices, setGoldPrices] = useState(null);
  const [forex, setForex] = useState(null);
  const [baseRate, setBaseRate] = useState(null);
  const [equity, setEquity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple&vs_currencies=usd"
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
        aed: parseFloat(goldAED).toLocaleString(),
      });
    } catch (err) {
      console.error("Gold fetch error:", err);
    }
  };

 const fetchForex = async () => {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await response.json();

    // 1 AED = how many INR
    const aedToInr = data.rates.INR / data.rates.AED;
    setBaseRate(aedToInr.toFixed(4));

    setForex({
      aed: data.rates.AED.toFixed(4),
      eur: data.rates.EUR.toFixed(4),
      gbp: data.rates.GBP.toFixed(4),
      inr: data.rates.INR.toFixed(4),
      jpy: data.rates.JPY.toFixed(4),
    });
  } catch (err) {
    console.error("Forex fetch error:", err);
  }
};

  const fetchEquity = async () => {
    try {
      const [emaarRes, dibRes, emiratesRes] = await Promise.all([
        fetch("https://corsproxy.io/?url=https://query1.finance.yahoo.com/v8/finance/chart/EMAAR.DFM"),
        fetch("https://corsproxy.io/?url=https://query1.finance.yahoo.com/v8/finance/chart/DIB.DFM"),
        fetch("https://corsproxy.io/?url=https://query1.finance.yahoo.com/v8/finance/chart/EMIRATES.DFM"),
      ]);

      const emaarData = await emaarRes.json();
      const dibData = await dibRes.json();
      const emiratesData = await emiratesRes.json();

      setEquity({
        emaar: {
          price: emaarData.chart.result?.[0]?.meta?.regularMarketPrice ?? "N/A",
          change: (emaarData.chart.result?.[0]?.meta?.regularMarketPrice - emaarData.chart.result?.[0]?.meta?.previousClose).toFixed(2),
        },
        dib: {
          price: dibData.chart.result?.[0]?.meta?.regularMarketPrice ?? "N/A",
          change: (dibData.chart.result?.[0]?.meta?.regularMarketPrice - dibData.chart.result?.[0]?.meta?.previousClose).toFixed(2),
        },
        emirates: {
          price: emiratesData.chart.result?.[0]?.meta?.regularMarketPrice ?? "N/A",
          change: (emiratesData.chart.result?.[0]?.meta?.regularMarketPrice - emiratesData.chart.result?.[0]?.meta?.previousClose).toFixed(2),
        },
      });
    } catch (err) {
      console.error("Equity fetch error:", err);
    }
  };

  useEffect(() => {
    fetchPrices();
    fetchGold();
    fetchForex();
    fetchEquity();

    const interval = setInterval(() => {
      fetchPrices();
      fetchGold();
      fetchForex();
      fetchEquity();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Loading Live Market Data...</p>
    </div>
  );

  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Live Market Dashboard</h1>
        <span className="live-badge">🟢 LIVE</span>
      </div>
<div className="col">
      <div className="cards-grid d-flex flex-wrap gap-4 justify-center">

        {/* CARD 1 - CRYPTO */}
        <div className="card">
          <div className="card-header crypto-header">
            <h2>🪙 Crypto</h2>
            <span className="card-badge">USD</span>
          </div>
          <div className="card-body">
            {[
              { name: "Bitcoin", key: "bitcoin" },
              { name: "Ethereum", key: "ethereum" },
              { name: "Solana", key: "solana" },
              { name: "XRP", key: "ripple" },
            ].map((coin) => (
              <div className="row-item" key={coin.key}>
                <span className="item-name">{coin.name}</span>
                <span className="item-value">${prices?.[coin.key]?.usd.toLocaleString() ?? "..."}</span>
              </div>
            ))}
          </div>
        </div>
    {/* CARD 3 - FOREX */}
       <div className="card">
  <div className="card-header forex-header">
    <h2>💱 Forex</h2>
    <span className="card-badge">1 USD =</span>
  </div>
  <div className="card-body">

    {/* AED to INR rate at top */}
    <div className="row-item forex-native">
      <span className="item-name ">AED / INR</span>
      <span className="item-value">{baseRate ?? "..."}</span>
    </div>

    {/* Divider */}
    <div className="forex-divider">USD =</div>

    {/* Rest of currencies */}
    {[
      { name: "UAE Dirham", key: "aed", symbol: "AED" },
      { name: "Euro", key: "eur", symbol: "EUR" },
      { name: "British Pound", key: "gbp", symbol: "GBP" },
      { name: "Indian Rupee", key: "inr", symbol: "INR" },
      { name: "Japanese Yen", key: "jpy", symbol: "JPY" },
    ].map((currency) => (
      <div className="row-item" key={currency.key}>
        <span className="item-name">{currency.name}</span>
        <span className="item-value">{currency.symbol} {forex?.[currency.key] ?? "..."}</span>
      </div>
    ))}
  </div>
</div>

        {/* CARD 2 - GOLD */}
        <div className="card">
          <div className="card-header gold-header">
            <h2>🥇 Gold</h2>
            <span className="card-badge">per oz</span>
          </div>
          <div className="card-body">
            <div className="row-item">
              <span className="item-name">USD</span>
              <span className="item-value">${goldPrices?.usd ?? "Loading..."}</span>
            </div>
            <div className="row-item">
              <span className="item-name">AED</span>
              <span className="item-value gold-aed">AED {goldPrices?.aed ?? "Loading..."}</span>
            </div>
            <div className="row-item">
              <span className="item-name">Per Gram (USD)</span>
              <span className="item-value">
                ${goldPrices?.usd ? (parseFloat(goldPrices.usd.replace(/,/g, "")) / 31.1).toFixed(2) : "..."}
              </span>
            </div>
            <div className="row-item">
              <span className="item-name">Per Gram (AED)</span>
              <span className="item-value gold-aed">
                AED {goldPrices?.aed ? (parseFloat(goldPrices.aed.replace(/,/g, "")) / 31.1).toFixed(2) : "..."}
              </span>
            </div>
          </div>
        </div>

    
        {/* CARD 4 - UAE EQUITY */}
        <div className="card">
          <div className="card-header equity-header">
            <h2>🇦🇪 UAE Equity</h2>
            <span className="card-badge">DFM</span>
          </div>
          <div className="card-body">
            {[
              { name: "Emaar Properties", key: "emaar" },
              { name: "Dubai Islamic Bank", key: "dib" },
              { name: "Emirates NBD", key: "emirates" },
            ].map((stock) => (
              <div className="row-item" key={stock.key}>
                <span className="item-name">{stock.name}</span>
                <div className="stock-info">
                  <span className="item-value">{equity?.[stock.key]?.price ?? "..."}</span>
                  <span className={`change ${equity?.[stock.key]?.change > 0 ? "positive" : "negative"}`}>
                    {equity?.[stock.key]?.change > 0 ? "▲" : "▼"} {Math.abs(equity?.[stock.key]?.change) ?? ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
</div>
      <div className="dashboard-footer">
        <p>Auto refreshes every 30 seconds • Data from CoinGecko, Yahoo Finance, ExchangeRate API</p>
      </div>
    </div>
  );
};

export default CryptoPrices;