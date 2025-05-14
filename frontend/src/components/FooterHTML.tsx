import React from 'react';
import './FooterHTML.css';

const FooterHTML: React.FC = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-left">
        <h2 className="vintage-heading"><i className="fas fa-map-marker-alt"></i> Avenue habib bourguiba, Centre ville, Tunis.</h2>
        <div className="map-container">
            <iframe
              title="Google Map"
              src="https://www.google.com/maps?q=36.7996509,10.1824207&z=15&output=embed"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        <div className="footer-right">
          <div className="useful-links">
            <h3>Call Us:</h3>
            <ul>
              <li>+216 74 225 142</li>
              <li>Fax: +216 71 654 321</li>
              <li>contact@atb.com.tn </li>
            </ul>
            <div className="social-media-icons">
              <a href="https://www.facebook.com/ArabTunisianBank/" aria-label="Facebook" className="social-icon"><i className="fab fa-facebook-f"></i></a>
              <a href="https://x.com/i/flow/login?redirect_after_login=%2FATBTunisie" aria-label="Twitter" className="social-icon"><i className="fab fa-twitter"></i></a>
              <a href="https://www.instagram.com/arab_tunisian_bank/" aria-label="Instagram" className="social-icon"><i className="fab fa-instagram"></i></a>
            </div>
          </div>

          <div className="opening-hours">
            <h3>HORAIRES D'OUVERTURE</h3> 
            <p><strong>Du lundi au vendredi</strong><br />09:00 à 16:30</p>
            <p><strong>Le samedi</strong><br />09:00 à 12:00</p>
            <p><strong>Le dimanche</strong><br />Fermé</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>Copyright à écrire avec 2025----ATB .</p>
      </div>
    </footer>
  );
};

export default FooterHTML;
