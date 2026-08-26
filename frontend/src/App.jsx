import { useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [itemType, setItemType] = useState("lost");
  const [description, setDescription] = useState("");
  const [itemImage, setItemImage] = useState(null);

  const [result, setResult] = useState(null);
  const [matches, setMatches] = useState([]);
  const [items, setItems] = useState([]);

  const [lostImage, setLostImage] = useState(null);
  const [foundImage, setFoundImage] = useState(null);
  const [imageResult, setImageResult] = useState(null);

  const [combinedImage, setCombinedImage] = useState(null);
  const [combinedMatches, setCombinedMatches] = useState([]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [combinedLoading, setCombinedLoading] = useState(false);

  // -------------------------------------------------------
  // SUBMIT ITEM
  // -------------------------------------------------------

  const submitItem = async () => {
    if (!description.trim()) {
      setMessage("Please enter an item description.");
      return;
    }

    setLoading(true);
    setMessage("");
    setResult(null);

    try {
      const formData = new FormData();

      formData.append("item_type", itemType);
      formData.append("description", description);

      if (itemImage) {
        formData.append("image", itemImage);
      }

      const response = await fetch(`${API_URL}/items`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      setResult(data);
      setMessage("Item submitted successfully!");
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to backend.");
    }

    setLoading(false);
  };

  // -------------------------------------------------------
  // TEXT MATCHING
  // -------------------------------------------------------

  const findMatches = async () => {
    if (!description.trim()) {
      setMessage("Please enter an item description first.");
      return;
    }

    setLoading(true);
    setMessage("");
    setMatches([]);

    try {
      const url =
        `${API_URL}/match?description=` +
        encodeURIComponent(description);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      setMatches(data.matches || []);

      if ((data.matches || []).length === 0) {
        setMessage("No matching items found.");
      } else {
        setMessage("Possible text matches found!");
      }
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to backend.");
    }

    setLoading(false);
  };

  // -------------------------------------------------------
  // VIEW ALL ITEMS
  // -------------------------------------------------------

  const getAllItems = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/items`);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      setItems(data.items || []);

      if ((data.items || []).length === 0) {
        setMessage("No items have been reported yet.");
      } else {
        setMessage("All reported items loaded.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Could not load items.");
    }

    setLoading(false);
  };

  // -------------------------------------------------------
  // DIRECT IMAGE COMPARISON
  // -------------------------------------------------------

  const compareImages = async () => {
    if (!lostImage || !foundImage) {
      setMessage("Please select both lost and found images.");
      return;
    }

    setImageLoading(true);
    setMessage("");
    setImageResult(null);

    try {
      const formData = new FormData();

      formData.append("lost_image", lostImage);
      formData.append("found_image", foundImage);

      const response = await fetch(`${API_URL}/compare-images`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      setImageResult(data);

      if (data.success) {
        setMessage("Images compared successfully!");
      }
    } catch (error) {
      console.error(error);
      setMessage("Could not compare images.");
    }

    setImageLoading(false);
  };

  // -------------------------------------------------------
  // COMBINED MATCHING
  // -------------------------------------------------------

  const findCombinedMatches = async () => {
    if (!description.trim()) {
      setMessage("Please enter an item description.");
      return;
    }

    if (!combinedImage) {
      setMessage("Please select an image for matching.");
      return;
    }

    setCombinedLoading(true);
    setMessage("");
    setCombinedMatches([]);

    try {
      const formData = new FormData();

      formData.append("item_type", itemType);
      formData.append("description", description);
      formData.append("image", combinedImage);

      const response = await fetch(`${API_URL}/combined-match`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      setCombinedMatches(data.matches || []);

      if ((data.matches || []).length === 0) {
        setMessage("No opposite-type matches found.");
      } else {
        setMessage("AI combined matching completed!");
      }
    } catch (error) {
      console.error(error);
      setMessage("Could not perform combined matching.");
    }

    setCombinedLoading(false);
  };

  // -------------------------------------------------------
  // SCORE HELPERS
  // -------------------------------------------------------

  const getStatusClass = (status = "") => {
    const value = status.toLowerCase();

    if (value.includes("strong")) return "strong";
    if (value.includes("possible")) return "possible";
    return "low";
  };

  const getScoreClass = (score) => {
    if (score >= 70) return "score-high";
    if (score >= 45) return "score-medium";
    return "score-low";
  };

  return (
    <div className="app">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">🔎</div>

          <div>
            <h1>Lost & Found AI</h1>
            <span>Intelligent Item Recovery System</span>
          </div>
        </div>

        <div className="ai-status">
          <span className="status-dot"></span>
          AI System Online
        </div>
      </header>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="hero-section">

        <div className="hero-text">

          <div className="eyebrow">
            AI-POWERED RECOVERY PLATFORM
          </div>

          <h2>
            Find what you've
            <span> lost.</span>
          </h2>

          <p>
            Report lost and found items and let AI compare
            descriptions and images to discover potential matches.
          </p>

          <div className="hero-pills">
            <span>🧠 NLP</span>
            <span>🖼️ Computer Vision</span>
            <span>🤖 AI Matching</span>
          </div>

        </div>

        <div className="hero-visual">

          <div className="floating-card card-one">
            <span>👜</span>
            <div>
              <strong>Lost Bag</strong>
              <small>Searching...</small>
            </div>
          </div>

          <div className="hero-search">
            <span>🔍</span>
          </div>

          <div className="floating-card card-two">
            <span>📱</span>
            <div>
              <strong>Found Item</strong>
              <small>Potential match</small>
            </div>
          </div>

        </div>

      </section>


      {/* =====================================================
          MESSAGE
      ===================================================== */}

      {message && (
        <div className="message">
          <span>✓</span>
          {message}
        </div>
      )}


      {/* =====================================================
          REPORT ITEM
      ===================================================== */}

      <section className="main-grid">

        <div className="card report-card">

          <div className="section-heading">

            <div className="heading-icon blue">
              📦
            </div>

            <div>
              <h3>Report an Item</h3>
              <p>Tell us what you lost or found.</p>
            </div>

          </div>


          <div className="form-group">

            <label>Item Type</label>

            <div className="type-selector">

              <button
                className={itemType === "lost" ? "type-active" : ""}
                onClick={() => setItemType("lost")}
              >
                🔴 Lost Item
              </button>

              <button
                className={itemType === "found" ? "type-active found" : ""}
                onClick={() => setItemType("found")}
              >
                🟢 Found Item
              </button>

            </div>

          </div>


          <div className="form-group">

            <label>Item Description</label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Example: I lost my black Samsung phone in college..."
            />

            <small className="field-hint">
              Include colour, brand, location and other useful details.
            </small>

          </div>


          <div className="form-group">

            <label>Item Image</label>

            <label className="upload-box">

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setItemImage(e.target.files[0] || null)
                }
              />

              <div className="upload-icon">
                🖼️
              </div>

              <strong>
                {itemImage
                  ? itemImage.name
                  : "Upload an item image"}
              </strong>

              <span>
                PNG, JPG, JPEG or WEBP
              </span>

            </label>

          </div>


          <div className="button-row">

            <button
              className="primary-button"
              onClick={submitItem}
              disabled={loading}
            >
              {loading ? "Processing..." : "Submit Item →"}
            </button>

            <button
              className="secondary-button"
              onClick={findMatches}
              disabled={loading}
            >
              🔍 Text Matches
            </button>

            <button
              className="secondary-button"
              onClick={getAllItems}
              disabled={loading}
            >
              📋 View Items
            </button>

          </div>

        </div>


        {/* =====================================================
            AI MATCHING
        ===================================================== */}

        <div className="card ai-card">

          <div className="section-heading">

            <div className="heading-icon purple">
              🤖
            </div>

            <div>
              <h3>AI Combined Matching</h3>
              <p>Text + image intelligence</p>
            </div>

          </div>


          <div className="ai-explanation">

            <div className="ai-feature">
              <span>📝</span>
              <div>
                <strong>NLP Analysis</strong>
                <small>Understands descriptions</small>
              </div>
            </div>

            <div className="plus">+</div>

            <div className="ai-feature">
              <span>🖼️</span>
              <div>
                <strong>Computer Vision</strong>
                <small>Compares visual features</small>
              </div>
            </div>

          </div>


          <label className="upload-box ai-upload">

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setCombinedImage(
                  e.target.files[0] || null
                );
                setCombinedMatches([]);
              }}
            />

            <div className="upload-icon purple-icon">
              🤖
            </div>

            <strong>
              {combinedImage
                ? combinedImage.name
                : "Choose image for AI matching"}
            </strong>

            <span>
              AI will compare this against opposite-type reports
            </span>

          </label>


          <button
            className="ai-button"
            onClick={findCombinedMatches}
            disabled={
              combinedLoading ||
              !combinedImage ||
              !description.trim()
            }
          >
            {combinedLoading
              ? "🤖 AI is analyzing..."
              : "🤖 Find AI Matches"}
          </button>

        </div>

      </section>


      {/* =====================================================
          DIRECT IMAGE COMPARISON
      ===================================================== */}

      <section className="card comparison-card">

        <div className="section-heading">

          <div className="heading-icon orange">
            🖼️
          </div>

          <div>
            <h3>Direct Image Comparison</h3>
            <p>Compare a lost image with a found image.</p>
          </div>

        </div>


        <div className="image-comparison-grid">

          <label className="image-drop">

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setLostImage(e.target.files[0] || null);
                setImageResult(null);
              }}
            />

            <span className="drop-number">01</span>

            <div className="drop-icon">
              🔴
            </div>

            <strong>
              {lostImage
                ? lostImage.name
                : "Upload Lost Image"}
            </strong>

            <small>
              Select the original lost item
            </small>

          </label>


          <div className="compare-symbol">
            ⇄
          </div>


          <label className="image-drop">

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setFoundImage(e.target.files[0] || null);
                setImageResult(null);
              }}
            />

            <span className="drop-number">02</span>

            <div className="drop-icon">
              🟢
            </div>

            <strong>
              {foundImage
                ? foundImage.name
                : "Upload Found Image"}
            </strong>

            <small>
              Select the possible found item
            </small>

          </label>

        </div>


        <button
          className="compare-button"
          onClick={compareImages}
          disabled={
            imageLoading ||
            !lostImage ||
            !foundImage
          }
        >
          {imageLoading
            ? "🔄 Comparing..."
            : "🔍 Compare Images"}
        </button>

      </section>


      {/* =====================================================
          IMAGE RESULT
      ===================================================== */}

      {imageResult && imageResult.success && (

        <section className="result-card">

          <div className="result-header">

            <div>
              <span className="result-label">
                COMPUTER VISION RESULT
              </span>

              <h3>Image Matching Analysis</h3>
            </div>

            <span
              className={`status-badge ${getStatusClass(
                imageResult.match_status
              )}`}
            >
              {imageResult.match_status}
            </span>

          </div>


          <div className="score-section">

            <div
              className={`score-circle ${getScoreClass(
                imageResult.image_similarity
              )}`}
            >
              <strong>
                {imageResult.image_similarity}%
              </strong>

              <span>
                Similarity
              </span>
            </div>

            <div className="score-info">

              <h4>
                Visual Feature Similarity
              </h4>

              <p>
                ResNet18 compares visual features extracted
                from both images.
              </p>

              <div className="progress">
                <div
                  style={{
                    width: `${Math.min(
                      imageResult.image_similarity,
                      100
                    )}%`,
                  }}
                />
              </div>

              <small>
                This score represents visual similarity,
                not the probability that the objects are identical.
              </small>

            </div>

          </div>

        </section>

      )}


      {/* =====================================================
          SUBMITTED RESULT
      ===================================================== */}

      {result && result.success && (

        <section className="result-card success-card">

          <div className="success-icon">
            ✓
          </div>

          <div>

            <span className="result-label">
              SUCCESS
            </span>

            <h3>Item Submitted Successfully</h3>

            <div className="result-details">

              <span>
                <strong>ID</strong>
                #{result.item_id}
              </span>

              <span>
                <strong>TYPE</strong>
                {result.item_type}
              </span>

              <span>
                <strong>IMAGE</strong>
                {result.image_path
                  ? "Saved"
                  : "Not uploaded"}
              </span>

            </div>

          </div>

        </section>

      )}


      {/* =====================================================
          AI MATCHES
      ===================================================== */}

      {combinedMatches.length > 0 && (

        <section className="results-section">

          <div className="results-title">

            <div>
              <span className="result-label">
                AI ANALYSIS
              </span>

              <h3>🤖 Potential Matches</h3>
            </div>

            <span className="count-badge">
              {combinedMatches.length} found
            </span>

          </div>


          <div className="match-grid">

            {combinedMatches.map((match) => (

              <div
                className="match-card"
                key={match.item_id}
              >

                <div className="match-top">

                  <span className="item-id">
                    ITEM #{match.item_id}
                  </span>

                  <span
                    className={`status-badge ${getStatusClass(
                      match.match_status
                    )}`}
                  >
                    {match.match_status}
                  </span>

                </div>

                <h4>
                  {match.description}
                </h4>

                <span className="item-type">
                  {match.item_type === "lost"
                    ? "🔴 Lost"
                    : "🟢 Found"}
                </span>


                <div className="metrics">

                  <div>
                    <span>Text</span>
                    <strong>
                      {match.text_similarity}%
                    </strong>
                  </div>

                  <div>
                    <span>Image</span>
                    <strong>
                      {match.image_similarity}%
                    </strong>
                  </div>

                  <div className="combined-score">
                    <span>Combined</span>
                    <strong>
                      {match.combined_score}%
                    </strong>
                  </div>

                </div>


                <div className="mini-progress">

                  <div
                    style={{
                      width: `${Math.min(
                        match.combined_score,
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>

            ))}

          </div>

        </section>

      )}


      {/* =====================================================
          TEXT MATCHES
      ===================================================== */}

      {matches.length > 0 && (

        <section className="results-section">

          <div className="results-title">

            <div>
              <span className="result-label">
                NLP ANALYSIS
              </span>

              <h3>🔍 Text Matches</h3>
            </div>

          </div>


          <div className="match-grid">

            {matches.map((match) => (

              <div
                className="match-card"
                key={match.item_id}
              >

                <div className="match-top">

                  <span className="item-id">
                    ITEM #{match.item_id}
                  </span>

                  <span className="text-score">
                    {Math.round(
                      match.similarity * 100
                    )}%
                  </span>

                </div>

                <h4>
                  {match.description}
                </h4>

                <span className="item-type">
                  {match.item_type === "lost"
                    ? "🔴 Lost"
                    : "🟢 Found"}
                </span>

              </div>

            ))}

          </div>

        </section>

      )}


      {/* =====================================================
          ALL ITEMS
      ===================================================== */}

      {items.length > 0 && (

        <section className="results-section">

          <div className="results-title">

            <div>
              <span className="result-label">
                DATABASE
              </span>

              <h3>📋 Reported Items</h3>
            </div>

            <span className="count-badge">
              {items.length} items
            </span>

          </div>


          <div className="match-grid">

            {items.map((item) => (

              <div
                className="match-card database-card"
                key={item.id}
              >

                <div className="match-top">

                  <span className="item-id">
                    ITEM #{item.id}
                  </span>

                  <span
                    className={
                      item.item_type === "lost"
                        ? "lost-badge"
                        : "found-badge"
                    }
                  >
                    {item.item_type}
                  </span>

                </div>

                <h4>
                  {item.description}
                </h4>

                <p className="keywords">
                  {item.keywords}
                </p>

                <div className="database-footer">

                  <span>
                    Status: {item.status}
                  </span>

                  <span>
                    {item.image_path
                      ? "🖼️ Image"
                      : "No image"}
                  </span>

                </div>

              </div>

            ))}

          </div>

        </section>

      )}


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer>

        <div>
          <strong>🔎 Lost & Found AI</strong>
          <span>AI-powered item recovery</span>
        </div>

        <span>
          Computer Vision • NLP • LLM • FastAPI
        </span>

      </footer>

    </div>
  );
}

export default App;