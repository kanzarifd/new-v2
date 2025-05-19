import React from 'react';
import './FooterHTML.css';

const FooterHTML: React.FC = () => {
  return (
<div className="footer-bottom">
  <div className="social-media-icons">
    <a href="https://www.facebook.com/ArabTunisianBank/" aria-label="Facebook" className="social-icon">
      <i className="fab fa-facebook-f"></i>
    </a>
    <a href="https://x.com/i/flow/login?redirect_after_login=%2FATBTunisie" aria-label="Twitter" className="social-icon">
      <i className="fab fa-twitter"></i>
    </a>
    <a href="https://www.instagram.com/arab_tunisian_bank/" aria-label="Instagram" className="social-icon">
      <i className="fab fa-instagram"></i>
    </a>
  </div>
  <p className="vintage-heading">Copyright à écrire avec 2025----ATB.</p>
</div>

  
  );
};

export default FooterHTML;
