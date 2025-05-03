import { Link } from "react-router-dom";
import "../styles/NotFound.css";
function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for does not exist or has been moved.</p>
        <div className="not-found-actions">
          <Link to="/" className="home-button">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;