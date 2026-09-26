import { motion } from 'framer-motion';
import { FiExternalLink, FiTarget } from 'react-icons/fi';
import { SiLeetcode, SiHackerrank, SiCodeforces } from 'react-icons/si';
import { useCounter } from '../../hooks/useAnimations';
import mernImg from '../../assets/MERN.png';
import nodejsImg from '../../assets/Nodejs.png';
import problemSolvingImg from '../../assets/Problem Solving.png';
import './CodingProfiles.css';

const profiles = [
  {
    platform: 'Total Problems',
    icon: FiTarget,
    stat: '200+',
    statValue: 200,
    suffix: '+',
    label: 'Problems Solved',
    description: 'Across LeetCode, Codeforces, HackerRank and more',
    color: '#6C63FF',
    link: null,
    bgGradient: 'linear-gradient(135deg, rgba(108, 99, 255, 0.12), rgba(108, 99, 255, 0.02))',
  },
  {
    platform: 'LeetCode',
    icon: SiLeetcode,
    stat: '100+',
    statValue: 100,
    suffix: '+',
    label: 'Problems Solved',
    description: 'Solving algorithmic challenges and mastering data structures',
    color: '#FFA116',
    link: 'https://leetcode.com/u/sMeZuEGhO5/',
    bgGradient: 'linear-gradient(135deg, rgba(255, 161, 22, 0.12), rgba(255, 161, 22, 0.02))',
  },
  {
    platform: 'Codeforces',
    icon: SiCodeforces,
    stat: '980',
    statValue: 980,
    suffix: '',
    label: 'Rating',
    description: 'Competitive programming and contest participation',
    color: '#0066FF',
    link: 'https://codeforces.com/profile/yashtheog',
    bgGradient: 'linear-gradient(135deg, rgba(0, 102, 255, 0.12), rgba(0, 102, 255, 0.02))',
  },
  {
    platform: 'HackerRank',
    icon: SiHackerrank,
    stat: '6',
    statValue: 6,
    suffix: '\u2605',
    label: 'Star Rating',
    description: 'Achieved 6-star rating in problem solving',
    color: '#00A651',
    link: 'https://hackerrank.com/profile/edukondalu1522',
    bgGradient: 'linear-gradient(135deg, rgba(0, 166, 81, 0.12), rgba(0, 166, 81, 0.02))',
  }
];

function ProfileCard({ profile, index }) {
  const [ref, count] = useCounter(profile.statValue, 2000);
  const Icon = profile.icon;

  return (
    <motion.div
      ref={ref}
      className="profiles__card glass-card"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      viewport={{ once: true }}
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
      style={{ background: profile.bgGradient }}
    >
      <div className="profiles__card-glow" style={{ background: `${profile.color}15` }} />

      <div className="profiles__card-header">
        <div className="profiles__card-icon" style={{ color: profile.color }}>
          <Icon size={32} />
        </div>
        {profile.link && (
          <a
            href={profile.link}
            target="_blank"
            rel="noopener noreferrer"
            className="profiles__card-link"
            style={{ color: profile.color }}
            aria-label={`Visit ${profile.platform}`}
          >
            <FiExternalLink size={18} />
          </a>
        )}
      </div>

      <h3 className="profiles__card-platform">{profile.platform}</h3>

      <div className="profiles__card-stat" style={{ color: profile.color }}>
        <span className="profiles__card-number">{count}</span>
        <span className="profiles__card-suffix">{profile.suffix}</span>
      </div>

      <p className="profiles__card-label">{profile.label}</p>
      <p className="profiles__card-desc">{profile.description}</p>

      <div className="profiles__card-bar">
        <motion.div
          className="profiles__card-bar-fill"
          style={{ background: profile.color }}
          initial={{ width: 0 }}
          whileInView={{ width: '100%' }}
          transition={{ duration: 1.5, delay: 0.3 + index * 0.1 }}
          viewport={{ once: true }}
        />
      </div>
    </motion.div>
  );
}

const certificates = [
  { title: 'MERN Full Stack', image: mernImg },
  { title: 'Node JS', image: nodejsImg },
  { title: 'Problem Solving', image: problemSolvingImg },
];

export default function CodingProfiles() {
  return (
    <section id="profiles" className="profiles section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section__title">Coding Profiles</h2>
          <p className="section__subtitle">My competitive programming journey and problem-solving stats.</p>
        </motion.div>

        <div className="profiles__grid">
          {profiles.map((profile, i) => (
            <ProfileCard key={profile.platform} profile={profile} index={i} />
          ))}
        </div>

        <motion.div
          className="certificates"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="certificates__title">My Certificates</h3>
          <p className="certificates__subtitle">Professional certifications showcasing my expertise in various technologies.</p>
          <div className="certificates__grid">
            {certificates.map((cert, i) => (
              <motion.div
                className="certificates__card glass-card"
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <div className="certificates__card-image">
                  <img src={cert.image} alt={cert.title} className="certificates__card-img" />
                </div>
                <h4 className="certificates__card-name">{cert.title}</h4>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
