import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, MessageCircle, Target, TrendingUp, Star } from 'lucide-react'

const ScoreCard = ({ question, answer, evaluation, questionNumber }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-50'
    if (score >= 6) return 'text-blue-600 bg-blue-50'
    if (score >= 4) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getScoreLabel = (score) => {
    if (score >= 8) return 'Excellent'
    if (score >= 6) return 'Good'
    if (score >= 4) return 'Fair'
    return 'Needs Improvement'
  }

  return (
    <motion.div
      className="card"
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-primary-600">
              {questionNumber}
            </span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Question {questionNumber}
          </h4>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(evaluation.overallScore)}`}>
            {evaluation.overallScore}/10 - {getScoreLabel(evaluation.overallScore)}
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Question */}
      <div className="mb-4">
        <p className="text-gray-800 dark:text-gray-100 font-medium leading-relaxed">
          {question}
        </p>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">Relevance</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {evaluation.relevance}/10
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-600">Fluency</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {evaluation.fluency}/10
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-600">Confidence</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {evaluation.confidence}/10
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="border-t pt-4 space-y-4">
          {/* Your Answer */}
          <div>
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Your Answer
            </h5>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-gray-800 dark:text-gray-100 leading-relaxed">
                {answer}
              </p>
            </div>
          </div>

          {/* AI Feedback */}
          <div>
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              AI Feedback
            </h5>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-gray-800 dark:text-gray-100 leading-relaxed">
                {evaluation.feedback}
              </p>
            </div>
          </div>

          {/* Detailed Scores */}
          <div>
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Detailed Scoring
            </h5>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-300">Relevance</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{evaluation.relevance}/10</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                  <motion.div 
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${evaluation.relevance * 10}%` }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-300">Fluency</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{evaluation.fluency}/10</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                  <motion.div 
                    className="bg-green-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${evaluation.fluency * 10}%` }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-300">Confidence</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{evaluation.confidence}/10</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                  <motion.div 
                    className="bg-purple-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${evaluation.confidence * 10}%` }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ScoreCard
