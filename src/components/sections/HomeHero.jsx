import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HomeHero() {
  return (
    <div className="text-center mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="inline-block bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm mb-6"
      >
        Now turning GitHub commits into real stories ✨
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-6xl font-bold text-white mb-6"
      >
        Turn Your GitHub Work Into
        <br />
        <span className="text-blue-400">Recruiter-Ready</span> Stories
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
      >
        Stop struggling to explain your projects. Instantly convert real commits, repositories, and development work into powerful LinkedIn posts that actually get noticed.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Link
          to="/generatePost"
          className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors inline-block"
        >
          Generate Your First Post
        </Link>
      </motion.div>
    </div>
  );
}
