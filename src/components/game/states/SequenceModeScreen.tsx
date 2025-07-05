import React, { useState, useEffect } from 'react'
import { TargetProps } from '@/hooks/useGameLogic'

interface SequenceModeScreenProps {
  targetProps: TargetProps
  onSequenceClick: (choice: number) => void
}

const SequenceModeScreen: React.FC<SequenceModeScreenProps> = ({ targetProps, onSequenceClick }) => {
  const [showingSequence, setShowingSequence] = useState(true)
  const [currentShowIndex, setCurrentShowIndex] = useState(0)

  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500']
  const colorNames = ['빨간색', '파란색', '초록색', '노란색']

  useEffect(() => {
    if (!targetProps.targetSequence) return

    // Show sequence one by one
    const showSequence = async () => {
      setShowingSequence(true)
      setCurrentShowIndex(0)

      for (let i = 0; i < targetProps.targetSequence!.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600))
        setCurrentShowIndex(i)
        await new Promise(resolve => setTimeout(resolve, 400))
      }

      await new Promise(resolve => setTimeout(resolve, 500))
      setShowingSequence(false)
    }

    showSequence()
  }, [targetProps.targetSequence])

  const getButtonClass = (index: number) => {
    const baseClass = `w-20 h-20 rounded-lg border-2 border-white shadow-lg transition-all duration-200 ${colors[index]}`
    
    if (showingSequence && targetProps.targetSequence) {
      const isCurrentlyShowing = currentShowIndex < targetProps.targetSequence.length && 
                                 targetProps.targetSequence[currentShowIndex] === index
      return `${baseClass} ${isCurrentlyShowing ? 'scale-110 ring-4 ring-white' : 'opacity-50'}`
    }

    const isInCurrentSequence = targetProps.currentSequence?.includes(index)
    return `${baseClass} hover:scale-110 focus:scale-110 focus:outline-none focus:ring-4 focus:ring-primary/50 ${
      isInCurrentSequence ? 'ring-2 ring-primary' : ''
    }`
  }

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">순서 기억하기</h2>
        {showingSequence ? (
          <p className="text-lg text-muted-foreground">
            순서를 기억하세요... ({currentShowIndex + 1}/{targetProps.targetSequence?.length || 0})
          </p>
        ) : (
          <p className="text-lg text-muted-foreground">
            같은 순서로 클릭하세요! ({(targetProps.currentSequence?.length || 0)}/{targetProps.targetSequence?.length || 0})
          </p>
        )}
      </div>

      {/* Color buttons */}
      <div className="grid grid-cols-2 gap-4">
        {colors.map((_, index) => (
          <button
            key={index}
            onClick={() => !showingSequence && onSequenceClick(index)}
            className={getButtonClass(index)}
            disabled={showingSequence}
            aria-label={`${colorNames[index]} 버튼`}
          />
        ))}
      </div>

      {/* Progress indicator */}
      <div className="flex space-x-2">
        {targetProps.targetSequence?.map((colorIndex, step) => (
          <div
            key={step}
            className={`w-6 h-6 rounded-full border-2 border-white ${colors[colorIndex]} ${
              (targetProps.currentSequence?.length || 0) > step ? 'opacity-100' : 'opacity-30'
            }`}
          />
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>키보드: 1(빨강), 2(파랑), 3(초록), 4(노랑)</p>
      </div>
    </div>
  )
}

export default SequenceModeScreen