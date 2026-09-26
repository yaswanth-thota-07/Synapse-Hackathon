import { motion } from 'framer-motion';
import { FiGithub, FiExternalLink } from 'react-icons/fi';
import weather from '../../assets/weather2.png';
import movieFinder from '../../assets/movie finder.png';
import restaurant from '../../assets/restaurant.png';
import auth from '../../assets/auth.png';
import gym from '../../assets/gym.png';
import api from '../../assets/api.png';
import payment from '../../assets/payment.jpeg';


import './Projects.css';

const projects = [
  {
    title: 'Authentication System',
    description: 'Complete MERN stack authentication system with JWT tokens, protected routes, password hashing, email verification, and session management. Secure and production-ready.',
    tags: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT'],
    github: 'https://github.com/yashwanth-thota-07/Backend-Authentication',
    live: 'https://github.com/yashwanth-thota-07/Backend-Authentication',
    featured: true,
    image: auth,
  },
    {
    title: 'Online Payment System',
    description: 'Developed a payment gateway integration using Razorpay with a Node.js and Express backend. Features include secure payment processing, order creation, signature verification and callback URL handling.',
    tags: ['Node.js', 'Express', 'Razorpay API', 'Mongo DB'],
    github: 'https://github.com/yashwanth-thota-07/payment-gateway-backend',
    live: 'https://payment-gateway-backend-ud1i.onrender.com/',
    featured: true,
    image: payment,
  },
  {
    title: 'Custom REST APIs',
    description: 'Built robust RESTful APIs using Express.js with CRUD operations, middleware architecture, input validation, error handling, and MongoDB integration.',
    tags: ['Node.js', 'Express', 'MongoDB', 'REST API'],
    github: 'https://github.com/yashwanth-thota-07/todo-list-api',
    live: 'https://github.com/yashwanth-thota-07/todo-list-api',
    featured: false,
    image: api,
  },

  {
    title: 'Gym Website',
    description: 'A sleek and energetic gym website designed for a client with membership plans, trainer profiles, class schedules, and a contact form.',
    tags: ['React', 'CSS', 'JavaScript', 'Responsive'],
    github: 'https://github.com/yashwanth-thota-07/IronPulse-Gym',
    live: 'https://iron-pulse-gym-beta.vercel.app/',
    featured: false,
    image: gym,
  },
  {
    title: 'Movie Finder',
    description: 'A React application that lets users search for movies, view details, ratings, and trailers using a movie database API with a clean, modern UI.',
    tags: ['React', 'API', 'CSS', 'JavaScript'],
    github: 'https://github.com/yashwanth-thota-07/Movie-Finder',
    live: 'https://movie-finder-neon-psi.vercel.app/',
    featured: false,
    image: movieFinder,
  },
  {
    title: 'JavaScript Mini Project',
    description: 'A collection of interactive mini-projects built with vanilla JavaScript, including API connections, utilities, and UI components showcasing core JS concepts.',
    tags: ['JavaScript', 'HTML', 'CSS', 'DOM'],
    github: 'https://github.com/yashwanth-thota-07/weather-app',
    live: 'https://yashwanth-thota-07.github.io/weather-app/',
    featured: false,
    image: weather,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function Projects() {
  return (
    <section id="projects" className="projects section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section__title">Featured Projects</h2>
          <p className="section__subtitle">A selection of projects that showcase my skills and creativity.</p>
        </motion.div>

        <div className="projects__grid">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              className={`projects__card glass-card ${project.featured ? 'projects__card--featured' : ''}`}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="projects__card-image">
                {project.image ? (
                  <img src={project.image} alt={project.title} className="projects__card-image-img" />
                ) : (
                  <div className="projects__card-image-placeholder" />
                )}

              </div>

              <div className="projects__card-content">
                {project.featured && <span className="projects__card-badge">Featured</span>}
                <h3 className="projects__card-title">{project.title}</h3>
                <p className="projects__card-desc">{project.description}</p>
                <div className="projects__card-tags">
                  {project.tags.map((tag) => (
                    <span key={tag} className="projects__card-tag">{tag}</span>
                  ))}
                </div>
                <div className="projects__card-actions">
                  <a href={project.github} target="_blank" rel="noopener noreferrer" className="projects__card-btn">
                    <FiGithub size={16} /> Code
                  </a>
                  <a href={project.live} target="_blank" rel="noopener noreferrer" className="projects__card-btn projects__card-btn--primary">
                    <FiExternalLink size={16} /> Live Demo
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
