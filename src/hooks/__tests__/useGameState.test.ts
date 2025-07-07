/**
 * useGameState 훅 테스트
 * 게임 상태 관리 로직의 단위 테스트
 */

import { renderHook, act } from '@testing-library/react';
import { useGameState, GameMode } from '../useGameState';

describe('useGameState', () => {
  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useGameState({ gameMode: 'normal' }));
    
    expect(result.current.gameState).toBe('waiting');
    expect(result.current.reactionTime).toBeNull();
    expect(result.current.targetProps).toBeNull();
    expect(result.current.backgroundColor).toBe('bg-destructive');
  });

  it('should handle game state transitions correctly', () => {
    const { result } = renderHook(() => useGameState({ gameMode: 'normal' }));
    
    // Start game
    act(() => {
      result.current.startGame();
    });
    
    expect(result.current.gameState).toBe('ready');
    expect(result.current.backgroundColor).toBe('bg-primary');
    
    // End game with reaction time
    act(() => {
      result.current.endGame(250);
    });
    
    expect(result.current.gameState).toBe('result');
    expect(result.current.reactionTime).toBe(250);
    expect(result.current.backgroundColor).toBe('bg-background');
  });

  it('should handle too soon state', () => {
    const { result } = renderHook(() => useGameState({ gameMode: 'normal' }));
    
    act(() => {
      result.current.setTooSoon();
    });
    
    expect(result.current.gameState).toBe('tooSoon');
    expect(result.current.backgroundColor).toBe('bg-destructive');
  });

  it('should reset game state correctly', () => {
    const { result } = renderHook(() => useGameState({ gameMode: 'normal' }));
    
    // Set some state
    act(() => {
      result.current.startGame();
      result.current.endGame(300);
      result.current.setTargetProps({ 
        top: '50%', 
        left: '50%', 
        size: 50, 
        shape: 'div' as any,
        color: 'red' 
      });
    });
    
    expect(result.current.gameState).toBe('result');
    expect(result.current.reactionTime).toBe(300);
    expect(result.current.targetProps).not.toBeNull();
    
    // Reset
    act(() => {
      result.current.resetGame();
    });
    
    expect(result.current.gameState).toBe('waiting');
    expect(result.current.reactionTime).toBeNull();
    expect(result.current.targetProps).toBeNull();
  });

  it('should handle target mode background color correctly', () => {
    const { result } = renderHook(() => useGameState({ gameMode: 'target' }));
    
    expect(result.current.backgroundColor).toBe('bg-background'); // waiting state in target mode
    
    act(() => {
      result.current.startGame();
    });
    
    expect(result.current.backgroundColor).toBe('bg-background'); // ready state in target mode
    
    act(() => {
      result.current.setTooSoon();
    });
    
    expect(result.current.backgroundColor).toBe('bg-destructive'); // tooSoon state
  });

  it('should handle different game modes', () => {
    const modes: GameMode[] = ['normal', 'ranked', 'target', 'color', 'sequence'];
    
    modes.forEach(mode => {
      const { result } = renderHook(() => useGameState({ gameMode: mode }));
      
      expect(result.current.gameState).toBe('waiting');
      expect(result.current.reactionTime).toBeNull();
      expect(result.current.targetProps).toBeNull();
      
      // Test state transitions work for all modes
      act(() => {
        result.current.startGame();
      });
      
      expect(result.current.gameState).toBe('ready');
      
      act(() => {
        result.current.endGame(200);
      });
      
      expect(result.current.gameState).toBe('result');
      expect(result.current.reactionTime).toBe(200);
    });
  });

  it('should update target props correctly', () => {
    const { result } = renderHook(() => useGameState({ gameMode: 'target' }));
    
    const targetProps = {
      top: '25%',
      left: '75%',
      size: 100,
      shape: 'button' as any,
      color: 'blue',
      correctColor: 'red'
    };
    
    act(() => {
      result.current.setTargetProps(targetProps);
    });
    
    expect(result.current.targetProps).toEqual(targetProps);
    
    // Test updating with function
    act(() => {
      result.current.setTargetProps(prev => 
        prev ? { ...prev, size: 150 } : null
      );
    });
    
    expect(result.current.targetProps?.size).toBe(150);
    expect(result.current.targetProps?.color).toBe('blue');
  });
});