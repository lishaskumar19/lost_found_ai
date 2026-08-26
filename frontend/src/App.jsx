import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  // =====================================================
  // STATE
  // =====================================================

  const [itemType, setItemType] = useState("lost");
  const [description, setDescription] = useState("");
  const [itemImage, setItemImage] = useState(null);

  const [combinedImage, setCombinedImage] = useState(null);

  const [lostImage, setLostImage] = useState(null);
  const [foundImage, setFoundImage] = useState(null);

  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  const [items, setItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [combinedMatches, setCombinedMatches] = useState([]);

  const [imageResult, setImageResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [combinedLoading, setCombinedLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // =====================================================
  // LOAD ITEMS
  // =====================================================

  useEffect(() => {
    getAllItems();
  }, []);

  // =====================================================
  // SUBMIT ITEM
  // =====================================================

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

      // Refresh database
      await getAllItems();

    } catch (error) {
      console.error(error);
      setMessage("Could not submit item.");
    }

    setLoading(false);
  };

  // =====================================================
  // TEXT MATCHING
  // =====================================================

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

  // =====================================================
  // VIEW ALL ITEMS
  // =====================================================

  const getAllItems = async () => {
    try {
      const response = await fetch(`${API_URL}/items`);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      setItems(data.items || []);

    } catch (error) {
      console.error(error);
    }
  };

  // =====================================================
  // DIRECT IMAGE COMPARISON
  // =====================================================

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

  // =====================================================
  // COMBINED AI MATCHING
  // =====================================================

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

      console.log("AI MATCH RESPONSE:", data);

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

  // =====================================================
  // SCORE HELPERS
  // =====================================================

  const normalizeScore = (score) => {
    const value = Number(score);

    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.max(0, Math.min(value, 100));
  };

  const formatScore = (score) => {
    const value = normalizeScore(score);

    if (Number.isInteger(value)) {
      return `${value}%`;
    }

    return `${value.toFixed(2)}%`;
  };

  const getStatusClass = (status = "") => {
    const value = String(status).toLowerCase();

    if (value.includes("strong")) {
      return "strong";
    }

    if (
      value.includes("possible") ||
      value.includes("potential")
    ) {
      return "possible";
    }

    return "low";
  };

  const getScoreClass = (score) => {
    const value = normalizeScore(score);

    if (value >= 70) {
      return "score-high";
    }

    if (value >= 45) {
      return "score-medium";
    }

    return "score-low";
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="app">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="topbar">

        <div className="brand">

          <div className="brand-icon">
            🔎
          </div>

          <div>
            <h1>Lost &amp; Found AI</h1>
            <span>Intelligent Item Recovery System</span>
          </div>

        </div>

        <div className="ai-status">
          <span className="status-dot"></span>
          AI System Online
        </div>

      </header>


      {/* =================================================
          HERO
      ================================================= */}

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
              <strong>Lost Item</strong>
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


      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (

        <div className="message">

          <span>✓</span>

          {message}

        </div>

      )}


      {/* =================================================
          MAIN GRID
      ================================================= */}

      <section className="main-grid">


        {/* =================================================
            REPORT ITEM
        ================================================= */}

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
                type="button"
                className={
                  itemType === "lost"
                    ? "type-active"
                    : ""
                }
                onClick={() => setItemType("lost")}
              >
                🔴 Lost Item
              </button>

              <button
                type="button"
                className={
                  itemType === "found"
                    ? "type-active found"
                    : ""
                }
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
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Example: I lost my red water bottle with black cap..."
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
                  setItemImage(
                    e.target.files[0] || null
                  )
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
              type="button"
              className="primary-button"
              onClick={submitItem}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : "Submit Item →"}
            </button>


            <button
              type="button"
              className="secondary-button"
              onClick={findMatches}
              disabled={loading}
            >
              🔍 Text Matches
            </button>


            <button
              type="button"
              className="secondary-button"
              onClick={getAllItems}
              disabled={loading}
            >
              📋 View Items
            </button>

          </div>

        </div>


        {/* =================================================
            AI COMBINED MATCHING
        ================================================= */}

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


            <div className="ai-feature">

              <span>🖼️</span>

              <div>
                <strong>Computer Vision</strong>
                <small>Compares visual features</small>
              </div>

            </div>


            <div className="ai-feature">

              <span>🤖</span>

              <div>
                <strong>AI Matching</strong>
                <small>Combines both scores</small>
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
            type="button"
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


      {/* =================================================
          DIRECT IMAGE COMPARISON
      ================================================= */}

      <section className="card comparison-card">

        <div className="section-heading">

          <div className="heading-icon orange">
            🖼️
          </div>

          <div>
            <h3>Direct Image Comparison</h3>
            <p>
              Compare a lost image with a found image.
            </p>
          </div>

        </div>


        <div className="image-comparison-grid">


          <label className="image-drop">

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {

                setLostImage(
                  e.target.files[0] || null
                );

                setImageResult(null);

              }}
            />

            <span className="drop-number">
              01
            </span>

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

                setFoundImage(
                  e.target.files[0] || null
                );

                setImageResult(null);

              }}
            />

            <span className="drop-number">
              02
            </span>

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
          type="button"
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


      {/* =================================================
          IMAGE RESULT
      ================================================= */}

      {imageResult &&
        imageResult.success && (

          <section className="result-card">

            <div className="result-header">

              <div>

                <span className="result-label">
                  COMPUTER VISION RESULT
                </span>

                <h3>
                  Image Matching Analysis
                </h3>

              </div>

              <span
                className={`status-badge ${getStatusClass(
                  imageResult.match_status
                )}`}
              >
                {imageResult.match_status ||
                  "Image Comparison"}
              </span>

            </div>


            <div className="score-section">

              <div
                className={`score-circle ${getScoreClass(
                  imageResult.image_similarity
                )}`}
              >

                <strong>
                  {formatScore(
                    imageResult.image_similarity
                  )}
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
                  Computer vision compares visual
                  features extracted from both images.
                </p>


                <div className="progress">

                  <div
                    style={{
                      width: `${normalizeScore(
                        imageResult.image_similarity
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


      {/* =================================================
          SUBMITTED RESULT
      ================================================= */}

      {result &&
        result.success && (

          <section className="result-card success-card">

            <div className="success-icon">
              ✓
            </div>

            <div>

              <span className="result-label">
                SUCCESS
              </span>

              <h3>
                Item Submitted Successfully
              </h3>


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


      {/* =================================================
          AI MATCH RESULTS
      ================================================= */}

      {combinedMatches.length > 0 && (

        <section className="results-section">

          <div className="results-title">

            <div>

              <span className="result-label">
                AI ANALYSIS
              </span>

              <h3>
                🤖 Potential Matches
              </h3>

            </div>


            <span className="count-badge">
              {combinedMatches.length} found
            </span>

          </div>


          <div className="match-grid">

            {combinedMatches.map((match) => {

              const textScore =
                normalizeScore(
                  match.text_similarity
                );

              const imageScore =
                normalizeScore(
                  match.image_similarity
                );

              const combinedScore =
                normalizeScore(
                  match.combined_score
                );


              return (

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
                      {match.match_status ||
                        "Match"}
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


                  {/* =====================================
                      SCORE METRICS
                  ===================================== */}

                  <div className="metrics">

                    <div>

                      <span>
                        Text
                      </span>

                      <strong>
                        {formatScore(textScore)}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Image
                      </span>

                      <strong>
                        {formatScore(imageScore)}
                      </strong>

                    </div>


                    <div className="combined-score">

                      <span>
                        Combined
                      </span>

                      <strong>
                        {formatScore(combinedScore)}
                      </strong>

                    </div>

                  </div>


                  {/* =====================================
                      PROGRESS BAR
                  ===================================== */}

                  <div className="mini-progress">

                    <div
                      style={{
                        width:
                          `${combinedScore}%`,
                      }}
                    />

                  </div>


                  {/* =====================================
                      SCORE DETAILS
                  ===================================== */}

                  <div className="score-summary">

                    <div>
                      Text similarity:
                      <strong>
                        {formatScore(textScore)}
                      </strong>
                    </div>

                    <div>
                      Image similarity:
                      <strong>
                        {formatScore(imageScore)}
                      </strong>
                    </div>

                    <div>
                      Overall match:
                      <strong>
                        {formatScore(combinedScore)}
                      </strong>
                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        </section>

      )}


      {/* =================================================
          TEXT MATCHES
      ================================================= */}

      {matches.length > 0 && (

        <section className="results-section">

          <div className="results-title">

            <div>

              <span className="result-label">
                NLP ANALYSIS
              </span>

              <h3>
                🔍 Text Matches
              </h3>

            </div>

          </div>


          <div className="match-grid">

            {matches.map((match) => {

              const score =
                normalizeScore(
                  Number(match.similarity) * 100
                );


              return (

                <div
                  className="match-card"
                  key={match.item_id}
                >

                  <div className="match-top">

                    <span className="item-id">
                      ITEM #{match.item_id}
                    </span>

                    <span className="text-score">
                      {formatScore(score)}
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

              );

            })}

          </div>

        </section>

      )}


      {/* =================================================
          ALL ITEMS
      ================================================= */}

      {items.length > 0 && (

        <section className="results-section">

          <div className="results-title">

            <div>

              <span className="result-label">
                DATABASE
              </span>

              <h3>
                📋 Reported Items
              </h3>

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
                  {Array.isArray(item.keywords)
                    ? item.keywords.join(", ")
                    : item.keywords}
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


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer>

        <div>

          <strong>
            🔎 Lost &amp; Found AI
          </strong>

          <span>
            AI-powered item recovery
          </span>

        </div>


        <span>
          Computer Vision • NLP • LLM • FastAPI
        </span>

      </footer>

    </div>
  );
}

export default App;