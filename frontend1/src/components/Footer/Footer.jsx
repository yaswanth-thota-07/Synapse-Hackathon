import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import './Footer.css';

const socialLinks = [
  { icon: FiGithub, href: 'https://github.com/yashwanth-thota-07', label: 'GitHub' },
  { icon: FiLinkedin, href: 'https://linkedin.com/in/yashwanth-thota-aba68a388', label: 'LinkedIn' },
  { icon: FiMail, href: 'mailto:thotayashwanth86@example.com', label: 'Email' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          <motion.a
            href="#home"
            className="footer__logo"
            whileHover={{ scale: 1.05 }}
          >
            <span className="footer__logo-mark" />
            <span className="footer__logo-name">FLUX</span>
          </motion.a>

          <div className="footer__links">
            <a href="#about" className="footer__link">About</a>
            <a href="#skills" className="footer__link">Skills</a>
            <a href="#projects" className="footer__link">Projects</a>
            <a href="#contact" className="footer__link">Contact</a>
          </div>

          <div className="footer__socials">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__social"
                  aria-label={social.label}
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        </div>

        <div className="footer__bottom">
          <p>
            Designed & Built by Yashwanth Thota &copy; {year}
          </p>
        </div>
      </div>
    </footer>
  );
}