import React from 'react'
import { TargetProps } from '@/hooks/useGameLogic'

interface ColorModeScreenProps {
  targetProps: TargetProps
  onColorClick: (color: string) => void
}

const ColorModeScreen: React.FC<ColorModeScreenProps> = ({ targetProps, onColorClick }) => {
  const colors = [
    { color: 'bg-red-500', name: '빨간색' },
    { color: 'bg-blue-500', name: '파란색' },
    { color: 'bg-green-500', name: '초록색' },
    { color: 'bg-yellow-500', name: '노란색' },
    { color: 'bg-purple-500', name: '보라색' }
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">색상 매칭</h2>
        <p className="text-lg text-muted-foreground mb-8">
          표시된 색상과 같은 색상을 선택하세요!
        </p>
      </div>

      {/* Display target color */}
      <div className="flex flex-col items-center space-y-4">
        <p className="text-lg font-medium">목표 색상:</p>
        <div 
          className={`w-24 h-24 rounded-lg border-4 border-white shadow-lg ${targetProps.color}`}
          aria-label="목표 색상"
        />
      </div>

      {/* Color choices */}
      <div className="flex flex-wrap gap-4 justify-center">
        {colors.map((colorOption) => (
          <button
            key={colorOption.color}
            onClick={() => onColorClick(colorOption.color)}
            className={`w-16 h-16 rounded-lg border-2 border-white shadow-lg transition-transform hover:scale-110 focus:scale-110 focus:outline-none focus:ring-4 focus:ring-primary/50 ${colorOption.color}`}
            aria-label={`${colorOption.name} 선택`}
          />
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>키보드: 1(빨강), 2(파랑), 3(초록), 4(노랑), 5(보라)</p>
      </div>
    </div>
  )
}

export default ColorModeScreen