import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-col">
          <h3>Kwathu Foods</h3>
          <p>Better Food – Better Living. Healthy living starts at home.</p>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/menu">Menu</Link></li>
            <li><Link to="/recipes">Recipes</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <p>Email: info@kwathufoods.com</p>
          <p>Location: Blantyre, Malawi</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Kwathu Foods. All rights reserved.</p>
      </div>
    </footer>
  );
}