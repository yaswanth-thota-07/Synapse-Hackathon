import { motion } from 'framer-motion';
import './FloatingElements.css';

const shapes = [
  { size: 60, top: '15%', left: '5%', delay: 0, duration: 18, type: 'circle' },
  { size: 40, top: '70%', left: '8%', delay: 2, duration: 22, type: 'square' },
  { size: 30, top: '40%', right: '6%', delay: 1, duration: 20, type: 'triangle' },
  { size: 50, top: '80%', right: '10%', delay: 3, duration: 25, type: 'circle' },
  { size: 35, top: '20%', right: '15%', delay: 4, duration: 19, type: 'square' },
  { size: 25, top: '55%', left: '12%', delay: 5, duration: 21, type: 'circle' },
];

export default function FloatingElements() {
  return (
    <div className="floating-elements" aria-hidden="true">
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          className={`floating-el floating-el--${shape.type}`}
          style={{
            width: shape.size,
            height: shape.size,
            top: shape.top,
            left: shape.left,
            right: shape.right,
          }}
          animate={{
            y: [0, -30, 15, -20, 0],
            rotate: [0, 10, -5, 15, 0],
            opacity: [0.04, 0.08, 0.04],
          }}
          transition={{
            duration: shape.duration,
            delay: shape.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
