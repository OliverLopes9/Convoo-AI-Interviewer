import React from 'react'
import { motion } from 'framer-motion'
import { Users, Code, Brain, ArrowRight } from 'lucide-react'

const CategoryCard = ({ category, onSelect, index }) => {
  const getCategoryIcon = (categoryId) => {
    switch (categoryId) {
      case 'hr':
        return <Users className="w-8 h-8" />
      case 'technical':
        return <Code className="w-8 h-8" />
      case 'behavioral':
        return <Brain className="w-8 h-8" />
      default:
        return <Users className="w-8 h-8" />
    }
  }

  const getCategoryColor = (categoryId) => {
    switch (categoryId) {
      case 'hr':
        return 'from-blue-500 to-blue-600'
      case 'technical':
        return 'from-green-500 to-green-600'
      case 'behavioral':
        return 'from-purple-500 to-purple-600'
      default:
        return 'from-primary-500 to-primary-600'
    }
  }

  const getCategoryDescription = (categoryId) => {
    switch (categoryId) {
      case 'hr':
        return ''
      case 'technical':
        return ''
      case 'behavioral':
        return ''
      default:
        return 'Practice interview questions'
    }
  }

  return (
    <motion.div
      className="card cursor-pointer group hover:shadow-lg transition-all duration-300"
      onClick={onSelect}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <div className="text-center">
        {/* Icon */}
        <motion.div 
          className={`w-16 h-16 bg-gradient-to-r ${getCategoryColor(category.id)} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white`}
          whileHover={{ rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {getCategoryIcon(category.id)}
        </motion.div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 transition-colors">
          {category.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">
          {getCategoryDescription(category.id)}
        </p>

        {/* Question Count */}
        <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-300 mb-6">
          <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {category.questionCount} questions
          </span>
        </div>

        {/* Start Button */}
        <motion.button
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Start Interview
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  )
}

export default CategoryCard
