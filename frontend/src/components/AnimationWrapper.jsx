import React from 'react'
import { AnimatePresence, motion } from 'framer-motion';
// import { GiDuration } from 'react-icons/gi';


const AnimationWrapper = ({ children, initial = { opacity: 0}, animate = { opacity: 1}, transition = { duration: 2 } }) => {
  return (
    <AnimatePresence>
      <motion.div
          initial = {initial}
          animate = {animate}
          transition = {transition}
      >
          {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default AnimationWrapper;