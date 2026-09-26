import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { FiMail, FiPhone, FiGithub, FiLinkedin, FiDownload, FiSend, FiMapPin } from 'react-icons/fi';
import './Contact.css';

const contactInfo = [
  { icon: FiMail, label: 'Email', value: 'thotayashwanth86@gmail.com', href: 'https://mail.google.com/mail/?view=cm&fs=1&to=thotayashwanth86@gmail.com' },
  
  { icon: FiMapPin, label: 'Location', value: 'Pune, Maharashtra', href: 'https://maps.app.goo.gl/mfRoTZjgyesXU5Z38' },
  { icon: FiGithub, label: 'GitHub', value: 'github.com/yashwanth-thota-07', href: 'https://github.com/yashwanth-thota-07' },
  { icon: FiLinkedin, label: 'LinkedIn', value: 'linkedin.com/in/yashwanth-thota-aba68a388', href: 'https://linkedin.com/in/yashwanth-thota-aba68a388' },
];

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [focused, setFocused] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const formRef = useRef();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formRef.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send message. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="contact section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section__title">Get In Touch</h2>
          <p className="section__subtitle">Have a project in mind or want to connect? I'd love to hear from you.</p>
        </motion.div>

        <div className="contact__grid">
          <motion.div
            className="contact__info"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="contact__info-cards">
              {contactInfo.map((info, i) => {
                const Icon = info.icon;
                const Wrapper = info.href ? 'a' : 'div';
                return (
                  <motion.div
                    key={info.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    viewport={{ once: true }}
                  >
                    <Wrapper
                      className="contact__info-card glass-card"
                      {...(info.href ? { href: info.href, target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      <div className="contact__info-icon">
                        <Icon size={20} />
                      </div>
                      <div>
                        <span className="contact__info-label">{info.label}</span>
                        <span className="contact__info-value">{info.value}</span>
                      </div>
                    </Wrapper>
                  </motion.div>
                );
              })}
            </div>

            <a href="/resume.pdf" className="contact__resume-btn" download>
              <FiDownload size={18} />
              <span>Download Resume</span>
            </a>
          </motion.div>

          <motion.form
            ref={formRef}
            className="contact__form glass-card"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="contact__form-row">
              <div className={`contact__field ${focused === 'name' || formData.name ? 'contact__field--active' : ''}`}>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  required
                  autoComplete="name"
                />
                <label>Your Name</label>
                <div className="contact__field-line" />
              </div>
              <div className={`contact__field ${focused === 'email' || formData.email ? 'contact__field--active' : ''}`}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  required
                  autoComplete="email"
                />
                <label>Your Email</label>
                <div className="contact__field-line" />
              </div>
            </div>

            <div className={`contact__field ${focused === 'subject' || formData.subject ? 'contact__field--active' : ''}`}>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                onFocus={() => setFocused('subject')}
                onBlur={() => setFocused(null)}
              />
              <label>Subject</label>
              <div className="contact__field-line" />
            </div>

            <div className={`contact__field contact__field--textarea ${focused === 'message' || formData.message ? 'contact__field--active' : ''}`}>
              <textarea
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                onFocus={() => setFocused('message')}
                onBlur={() => setFocused(null)}
                required
              />
              <label>Your Message</label>
              <div className="contact__field-line" />
            </div>

            <motion.button
              type="submit"
              className={`contact__submit ${submitted ? 'contact__submit--sent' : ''}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={sending}
            >
              {sending ? (
                <span>Sending...</span>
              ) : submitted ? (
                <span>Message Sent!</span>
              ) : (
                <>
                  <FiSend size={18} />
                  <span>Send Message</span>
                </>
              )}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
