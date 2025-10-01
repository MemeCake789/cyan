import './Nav.css';

const Nav = ({ activeView, onCyanideClick, onSulfurClick, onFlorideClick }) => { 
    return(
        <nav className='navbar'>            
            <a href="#" onClick={onCyanideClick} className={`nav-cyanide-button ${activeView === 'games' ? 'active' : ''}`}> cyλnide [games] </a>
            <a href="#" onClick={onSulfurClick} className={`nav-sulfur-button ${activeView === 'proxy' ? 'active' : ''}`}> sµlfur [proxy] </a>
            <a href="#" onClick={onFlorideClick} className={`nav-floride-button ${activeView === 'floride' ? 'active' : ''}`}> °Fluoride [ai] </a>
        </nav>
    );
};

export default Nav;
