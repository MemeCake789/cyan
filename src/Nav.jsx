import "./Nav.css";

const Nav = ({
  activeView,
  onCyanideClick,
  onSulfurClick,
  onFlorideClick,
  onChromiumClick,
  className,
}) => {
  return (
    <nav className={`navbar ${className || ""}`}>
      <a
        href="#"
        onClick={onCyanideClick}
        className={`nav-cyanide-button ${activeView === "games" ? "active" : ""}`}
        title="Games"
      >
        <span class="material-symbols-outlined">sports_esports</span> cyλnide
      </a>
      <a
        href="#"
        onClick={onSulfurClick}
        className={`nav-sulfur-button ${activeView === "proxy" ? "active" : ""}`}
        title="Proxy"
      >
        <span class="material-symbols-outlined">public</span> sµlfur
      </a>
      <a
        href="#"
        onClick={onFlorideClick}
        className={`nav-floride-button ${activeView === "floride" ? "active" : ""}`}
        title="AI"
      >
        <span class="material-symbols-outlined">smart_toy</span> °Fluoride
      </a>
      <a
        href="#"
        onClick={onChromiumClick}
        className={`nav-chromium-button ${activeView === "chromium" ? "active" : ""}`}
        title="Discord"
      >
        <span class="material-symbols-outlined">chat</span> chrθmium
      </a>
    </nav>
  );
};

export default Nav;
