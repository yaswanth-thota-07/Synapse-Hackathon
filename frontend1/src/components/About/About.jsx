import { motion } from 'framer-motion';
import { FiCode, FiCoffee, FiBookOpen, FiAward } from 'react-icons/fi';
import { useScrollReveal, useCounter } from '../../hooks/useAnimations';
import aboutImage from '../../assets/about.jpg';
import './About.css';

const stats = [
  { icon: FiCode, label: 'Projects', value: 10, suffix: '+' },
  { icon: FiCoffee, label: 'Problems Solved', value: 200, suffix: '+' },
  { icon: FiBookOpen, label: 'Technologies', value: 12, suffix: '+' },
  { icon: FiAward, label: 'Certifications', value: 3, suffix: '' },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: 'easeOut' },
  }),
};

function StatCard({ stat, index }) {
  const [ref, count] = useCounter(stat.value, 2000);
  const Icon = stat.icon;

  return (
    <motion.div
      ref={ref}
      className="about__stat"
      custom={index}
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="about__stat-icon">
        <Icon size={22} />
      </div>
      <div className="about__stat-value">
        {count}{stat.suffix}
      </div>
      <div className="about__stat-label">{stat.label}</div>
    </motion.div>
  );
}

export default function About() {
  const [ref] = useScrollReveal();

  return (
    <section id="about" className="about section" ref={ref}>
      <div className="container">
        <motion.div
          className="about__header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section__title">About Me</h2>
        
          <div className="about__header-line" />
        </motion.div>

        <div className="about__content">
          <motion.div
            className="about__image-side"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="about__image-bg" />
            <div className="about__image-frame">
              <img src={aboutImage} alt="Yashwanth Thota" className="about__image" />
            </div>
          </motion.div>

          <motion.div
            className="about__text-side"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <p>
              Hi, I'm Yashwanth Thota, a second-year B.Tech Information Technology student at the <span className="gradient-text">Army Institute of Technology (AIT), Pune</span>. I enjoy building websites and web applications that solve real problems and provide a great user experience. What started as curiosity about programming has grown into a passion for creating projects and learning new technologies.
            </p>
            <p>
              I've been focusing on full-stack web development with the <span className="gradient-text">MERN stack</span>, Authentication systems,Payment Gateway Backend, REST APIs, and responsive React applications. I also solve Data Structures and Algorithms<span className="gradient-text">DSA</span> problems and regularly give codeforces Contests.
              </p>
            <p>
              Outside of coding, I believe in learning by building. I'm always exploring new technologies, improving my existing projects, and looking for opportunities to grow as a developer. My goal is to become a software engineer who creates impactful applications, keeps learning, and enjoys the process of solving real-world problems.
            </p>

            <div className="about__tags">
              {['MERN Stack','API', 'React', 'DSA', 'Competitive Programming'].map((tag, i) => (
                <motion.span
                  key={tag}
                  className="about__tag"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  viewport={{ once: true }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="about__stats">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
