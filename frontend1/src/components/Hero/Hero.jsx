import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiMail, FiDownload, FiArrowRight } from 'react-icons/fi';
import { useTypingEffect } from '../../hooks/useAnimations';
import profileImage from '../../assets/profile.jpg';
import './Hero.css';

const roles = ['Full Stack Developer', 'Problem Solver', 'MERN Stack Enthusiast', 'Lifelong Learner'];

const riseVariants = {
  hidden: { opacity: 0, filter: 'blur(16px)', y: 30 },
  visible: (delay) => ({
    opacity: 1,
    filter: 'blur(0)',
    y: 0,
    transition: { duration: 1, delay, ease: [0.2, 0.7, 0.2, 1] },
  }),
};

export default function Hero() {
  const typedText = useTypingEffect(roles, 80, 40, 2000);

  return (
    <section id="home" className="hero">
      <div className="hero__container">
        <div className="hero__content">
          <motion.p
            className="hero__greeting"
            custom={0.3}
            initial="hidden"
            animate="visible"
            variants={riseVariants}
          >
            Hello, I'm
          </motion.p>

          <motion.h1
            className="hero__name"
            custom={0.38}
            initial="hidden"
            animate="visible"
            variants={riseVariants}
          >
            <span className="hero__name-first">Yashwanth</span>
            <span className="hero__name-last">Thota</span>
          </motion.h1>

          <motion.div
            className="hero__role"
            custom={0.49}
            initial="hidden"
            animate="visible"
            variants={riseVariants}
          >
            <span className="hero__role-prefix">I'm a     </span>
            <span className="hero__role-typed">         Full Stack Developer</span>
            <span className="hero__role-cursor"></span>
          </motion.div>

          <motion.p
            className="hero__description"
            custom={0.49}
            initial="hidden"
            animate="visible"
            variants={riseVariants}
          >
            Second Year B Tech IT student at Army Institute of Technology, Pune.
            Passionate about building Backend web applications and
            solving DSA problems through clean, efficient code.
          </motion.p>

          <motion.div
            className="hero__actions"
            custom={0.6}
            initial="hidden"
            animate="visible"
            variants={riseVariants}
          >
            <a href="#projects" className="hero__btn hero__btn--primary">
              <span>View Projects</span>
              <FiArrowRight size={16} className="hero__btn-arrow" />
            </a>
            <a href="/resume.pdf" download className="hero__btn hero__btn--secondary">
              <FiDownload size={16} />
              <span>Download Resume</span>
            </a>
          </motion.div>

          <motion.div
            className="hero__socials"
            custom={0.6}
            initial="hidden"
            animate="visible"
            variants={riseVariants}
          >
            <a href="https://github.com/yashwanth-thota-07" target="_blank" rel="noopener noreferrer" className="hero__social hero__social--github" aria-label="GitHub">
              <FiGithub size={18} />
            </a>
            <a href="https://linkedin.com/in/yashwanth-thota-aba68a388" target="_blank" rel="noopener noreferrer" className="hero__social hero__social--linkedin" aria-label="LinkedIn">
              <FiLinkedin size={18} />
            </a>
            <a href="mailto:edukondalu1522@gmail.com" className="hero__social hero__social--gmail" aria-label="Email">
              <FiMail size={18} />
            </a>
            <a href="/resume.pdf" className="hero__social hero__social--download" aria-label="Download Resume">
              <FiDownload size={18} />
            </a>
          </motion.div>
        </div>

        <motion.div
          className="hero__image-wrapper"
          custom={0.38}
          initial="hidden"
          animate="visible"
          variants={riseVariants}
        >
          <div className="hero__image-container">
            <img src={profileImage} alt="Yashwanth Thota" className="hero__image" />
          </div>
        </motion.div>

       
      </div>
    </section>
  );
}