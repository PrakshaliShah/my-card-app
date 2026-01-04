import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showZeroFees, setShowZeroFees] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiMode, setIsAiMode] = useState(true);

  useEffect(() => {
    Papa.parse("/cleaned_credit_cards.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => setData(results.data),
    });
  }, []);

  const handleAiSearch = () => {
    const query = aiPrompt.toLowerCase();
    setSearchTerm("");
    setSelectedCategory("All");
    setShowZeroFees(false);

    if (query.includes("budget") || query.includes("no fee") || query.includes("no ssn")) {
      setShowZeroFees(true);
    }
    if (query.includes("travel") || query.includes("points")) {
      setSelectedCategory("Travel");
    } else if (query.includes("student")) {
      setSearchTerm("Student");
    } else {
      setSearchTerm(aiPrompt);
    }
    setIsAiMode(false);
  };

  const filteredCards = data.filter(card => {
    const matchesSearch = (card["Product Name"]?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
                          (card["Institution Name"]?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || card["Reward_Type"] === selectedCategory;
    const matchesZeroFee = !showZeroFees || (card["Annual Fee"] === "$0" || card["Annual Fee"] === "0" || card["Annual Fee"] === "");
    return matchesSearch && matchesCategory && matchesZeroFee;
  });

  return (
    <div className="site-master-container">
      <nav className="navbar-fixed">
  <div className="inner-constraint flex-row">
    {/* Emoji added inside the brand div */}
    <div className="app-brand" onClick={() => setIsAiMode(true)}>
      <span className="brand-icon">💳</span>
      <strong>OmniCard</strong> View
    </div>
    <div className="nav-menu-links">
      <span onClick={() => setIsAiMode(true)}>Home</span>
      <span>Compare</span>
      <span>Resources</span>
    </div>
  </div>
</nav>

      {isAiMode ? (
        <section className="absolute-center-engine">
          <div className="hero-content-stack">
            <h1 className="black-text">Find Your Perfect Credit Card</h1>
            <h2 className="brand-accent-text">The AI Way</h2>
            
            <div className="input-search-area">
              <input 
                type="text" 
                placeholder='e.g., "I am a student and I dont have a ssn"' 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAiSearch()}
                className="ai-input-field-dark"
              />
              <button className="cta-btn-primary" onClick={handleAiSearch}>
                Match My Cards
              </button>
            </div>

            <div className="feature-row-centered">
              <div className="feature-box">
                <span className="feat-icon">📝</span>
                <h3 className="black-text">Personalized Logic</h3>
                <p className="gray-text">Describe your situation and let AI filter 540+ cards instantly.</p>
              </div>
              <div className="feature-box">
                <span className="feat-icon">💡</span>
                <h3 className="black-text">Smart Insights</h3>
                <p className="gray-text">We match card features to your specific requirements.</p>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <main className="results-scroll-area">
          <div className="inner-constraint">
            <div className="results-top-header">
              <h2 className="black-text">Top Recommendations <span>({filteredCards.length} matching)</span></h2>
              <button className="back-nav-btn" onClick={() => setIsAiMode(true)}>← Back to Search</button>
            </div>
            <div className="card-grid-display">
              {filteredCards.map((card, index) => (
                <div key={index} className="premium-ui-card">
                  <span className="inst-label-blue">{card["Institution Name"]}</span>
                  <h3 className="black-text">{card["Product Name"]}</h3>
                  <div className="reward-tag-badge">{card["Reward_Type"]}</div>
                  <p className="rewards-summary-text">{card["Rewards"]?.substring(0, 100)}...</p>
                  
                  <div className="footer-flex-stack">
  <div className="fee-data-group">
    <span className="fee-label-top">ANNUAL FEE</span>
    <strong className="fee-amount-large">{card["Annual Fee"] || "$0"}</strong>
  </div>
  {/* The Link Fix */}
  <a 
    href={card["Apply_Link"] || `https://www.google.com/search?q=${card["Product Name"]}`} 
    target="_blank" 
    rel="noreferrer"
    className="view-details-link"
  >
    <button className="btn-action-view">View Details</button>
  </a>
</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;