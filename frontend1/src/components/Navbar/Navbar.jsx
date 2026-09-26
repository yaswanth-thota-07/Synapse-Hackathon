import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import codolioLogo from '../../assets/codolio-logo.avif';
import './Navbar.css';

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#profiles', label: 'Profiles' },
  { href: '#testimonials', label: 'Journey' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const [active, setActive] = useState('#home');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);

      const sections = navLinks.map((l) => l.href.slice(1));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top <= 150) {
          setActive(`#${sections[i]}`);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 }}
    >
      <div className="navbar__container">
        <ul className="navbar__links">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`navbar__link ${active === link.href ? 'navbar__link--active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleClick(link.href);
                }}
              >
                {link.label}
                {active === link.href && (
                  <motion.span className="navbar__link-indicator" layoutId="nav-indicator" />
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="navbar__right">
          <div className="navbar__socials">
            <a href="https://github.com/yashwanth-thota-07" target="_blank" rel="noopener noreferrer" className="navbar__social navbar__social--github" aria-label="GitHub">
              <FaGithub size={22} />
            </a>
            <a href="https://linkedin.com/in/yashwanth-thota-aba68a388" target="_blank" rel="noopener noreferrer" className="navbar__social navbar__social--linkedin" aria-label="LinkedIn">
              <FaLinkedin size={22} />
            </a>
            <a href="https://instagram.com/yashellno" target="_blank" rel="noopener noreferrer" className="navbar__social navbar__social--instagram" aria-label="Instagram">
              <FaInstagram size={22} />
            </a>
            <a href="https://codolio.com/profile/yashtheog" target="_blank" rel="noopener noreferrer" className="navbar__social navbar__social--codolio" aria-label="Codolio">
              <img src={codolioLogo} alt="Codolio" className="navbar__social-img" />
            </a>
          </div>
          <button
            className="navbar__toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="navbar__mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                className={`navbar__mobile-link ${active === link.href ? 'navbar__mobile-link--active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleClick(link.href);
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {link.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}