import { motion } from 'framer-motion';
import {
  FiLayout, FiServer, FiDatabase, FiTerminal, FiTool
} from 'react-icons/fi';
import {
  SiHtml5, SiCss, SiJavascript, SiReact, SiNodedotjs,
  SiExpress, SiMongodb, SiCplusplus, SiGit, SiGithub,
  SiVscodium, SiPostman, SiRender, SiHackerrank, SiCodeforces
} from 'react-icons/si';
import './Skills.css';

const categories = [
  {
    id: 'frontend',
    label: 'Frontend',
    icon: FiLayout,
    skills: [
      { name: 'HTML', icon: SiHtml5, level: 90, color: '#E34F26' },
      { name: 'CSS', icon: SiCss, level: 85, color: '#1572B6' },
      { name: 'JavaScript', icon: SiJavascript, level: 80, color: '#F7DF1E' },
      { name: 'React', icon: SiReact, level: 75, color: '#61DAFB' },
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    icon: FiServer,
    skills: [
      { name: 'Node.js', icon: SiNodedotjs, level: 78, color: '#339933' },
      { name: 'Express.js', icon: SiExpress, level: 75, color: '#000000' },
    ],
  },
  {
    id: 'database',
    label: 'Database',
    icon: FiDatabase,
    skills: [
      { name: 'MongoDB', icon: SiMongodb, level: 72, color: '#47A248' },
    ],
  },
  {
    id: 'programming',
    label: 'Programming   DSA',
    icon: FiTerminal,
    skills: [
      { name: 'C++', icon: SiCplusplus, level: 80, color: '#00599C' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools & Other',
    icon: FiTool,
    skills: [
      { name: 'Deployment', icon: SiRender, level: 70, color: '#46E3B7' },
      { name: 'Git', icon: SiGit, level: 78, color: '#F05032' },
      { name: 'GitHub', icon: SiGithub, level: 80, color: '#171515' },
      { name: 'MongoDB', icon: SiMongodb, level: 85, color: '#04b459' },
      { name: 'Postman', icon: SiPostman, level: 75, color: '#FF6C37' },
    ],
  },
];

export default function Skills() {
  return (
    <section id="skills" className="skills section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section__title">Skills & Technologies</h2>
          <p className="section__subtitle">Technologies and tools I use to build modern web applications.</p>
        </motion.div>

        <motion.div
          className="skills__categories"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.id} className="skills__category">
                <div className="skills__category-header">
                  <Icon size={22} />
                  <h3>{cat.label}</h3>
                </div>
                <div className="skills__category-grid">
                  {cat.skills.map((skill, i) => (
                    <motion.div
                      key={skill.name}
                      className="skills__card glass-card"
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: i * 0.08, duration: 0.4 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -8, scale: 1.02 }}
                    >
                      <div className="skills__card-icon" style={{ color: skill.color }}>
                        <skill.icon size={36} />
                      </div>
                      <h3 className="skills__card-name">{skill.name}</h3>
                      <div className="skills__card-bar">
                        <div
                          className="skills__card-bar-fill"
                          style={{ background: skill.color }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
