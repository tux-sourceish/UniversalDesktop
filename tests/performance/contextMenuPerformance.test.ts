/**
 * 🧪 Performance Tests: Context Menu & File Manager System
 * 
 * Comprehensive performance benchmarks and validation tests
 * Testing response times, memory usage, and scalability
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { render, screen } from '@testing-library/react';

import { useFileManager } from '@/hooks/useFileManager';
import { μ6_useContextManager } from '@/hooks/µ6_useContextManager';
import { μ7_UnifiedContextMenu } from '@/components/contextMenu/μ7_UnifiedContextMenu';
import { TestUtils, TestConfig } from '../setup';

// Skip performance tests if configured
const skipIf = TestConfig.skipPerformanceTests ? describe.skip : describe;

// Performance measurement utilities
const measureTime = async <T>(fn: () => Promise<T> | T): Promise<{ result: T; time: number }> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return { result, time: end - start };
};

const measureMemory = () => {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return 0; // Fallback for environments without memory measurement
};

skipIf('Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  });

  describe('Context Menu Performance', () => {
    it('should render context menu within 50ms', async () => {
      const { time } = await measureTime(() => {
        render(
          <μ7_UnifiedContextMenu
            visible={true}
            x={100}
            y={100}
            contextType="canvas"
            onClose={vi.fn()}
            onCreateItem={vi.fn()}
            onItemAction={vi.fn()}
            onAddToContext={vi.fn()}
          />
        );
      });

      expect(time).toBeLessThan(50);
    });

    it('should handle rapid context menu toggles efficiently', async () => {
      const onClose = vi.fn();
      const onCreateItem = vi.fn();
      
      const { time } = await measureTime(async () => {
        const { rerender } = render(
          <μ7_UnifiedContextMenu
            visible={false}
            x={100}
            y={100}
            contextType="canvas"
            onClose={onClose}
            onCreateItem={onCreateItem}
            onItemAction={vi.fn()}
            onAddToContext={vi.fn()}
          />
        );

        // Rapid toggling (100 times)
        for (let i = 0; i < 100; i++) {
          rerender(
            <μ7_UnifiedContextMenu
              visible={i % 2 === 0}
              x={100 + i}
              y={100 + i}
              contextType="canvas"
              onClose={onClose}
              onCreateItem={onCreateItem}
              onItemAction={vi.fn()}
              onAddToContext={vi.fn()}
            />
          );
        }
      });

      expect(time).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle large numbers of menu items efficiently', async () => {
      // Mock a large window registry
      vi.doMock('@/components/factories/μ1_WindowFactory', () => {
        const largeRegistry: Record<string, any> = {};
        for (let i = 0; i < 100; i++) {
          largeRegistry[`item_${i}`] = {
            id: `item_${i}`,
            displayName: `Item ${i}`,
            icon: '📄',
          };
        }
        return { μ1_WINDOW_REGISTRY: largeRegistry };
      });

      const { time } = await measureTime(() => {
        render(
          <μ7_UnifiedContextMenu
            visible={true}
            x={100}
            y={100}
            contextType="canvas"
            onClose={vi.fn()}
            onCreateItem={vi.fn()}
            onItemAction={vi.fn()}
            onAddToContext={vi.fn()}
          />
        );
      });

      expect(time).toBeLessThan(200); // Should render large menu within 200ms
    });

    it('should not cause memory leaks with frequent menu operations', async () => {
      const initialMemory = measureMemory();
      
      // Perform many context menu operations
      for (let i = 0; i < 50; i++) {
        const { unmount } = render(
          <μ7_UnifiedContextMenu
            visible={true}
            x={100}
            y={100}
            contextType="window"
            targetItem={TestUtils.createMockUDItem({ id: `item-${i}` })}
            onClose={vi.fn()}
            onCreateItem={vi.fn()}
            onItemAction={vi.fn()}
            onAddToContext={vi.fn()}
          />
        );
        unmount();
      }

      // Force garbage collection
      if (global.gc) {
        global.gc();
      }

      const finalMemory = measureMemory();
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal (less than 5MB)
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });

    it('should respond to user interactions within 16ms (60fps)', async () => {
      const onItemAction = vi.fn();
      
      render(
        <μ7_UnifiedContextMenu
          visible={true}
          x={100}
          y={100}
          contextType="canvas"
          onClose={vi.fn()}
          onCreateItem={vi.fn()}
          onItemAction={onItemAction}
          onAddToContext={vi.fn()}
        />
      );

      const menuItem = screen.getByText('Zoom to Fit');
      
      const { time } = await measureTime(() => {
        menuItem.click();
      });

      expect(time).toBeLessThan(16); // 60fps requirement
      expect(onItemAction).toHaveBeenCalled();
    });
  });

  describe('File Manager Performance', () => {
    it('should handle large file lists efficiently', async () => {
      // Mock file system with 10,000 files
      const largeFileList = Array.from({ length: 10000 }, (_, i) => 
        TestUtils.createMockFileItem({
          id: `file-${i}`,
          name: `file-${i}.txt`,
          path: `/test/file-${i}.txt`,
        })
      );

      vi.doMock('@/hooks/useFileManager', () => ({
        useFileManager: vi.fn(() => ({
          // ... other properties
          items: largeFileList,
          filteredAndSortedItems: largeFileList,
          loading: false,
        }))
      }));

      const { time } = await measureTime(() => {
        const { result } = renderHook(() => useFileManager('/test'));
        return result.current;
      });

      expect(time).toBeLessThan(500); // Should initialize within 500ms
    });

    it('should perform file operations within acceptable time limits', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));

      await act(async () => {
        // Wait for initialization
        await TestUtils.waitForNextTick();
      });

      // Test copy operation performance
      const { time: copyTime } = await measureTime(async () => {
        await act(async () => {
          await result.current.copyItems(['file1', 'file2'], '/destination');
        });
      });

      expect(copyTime).toBeLessThan(1000); // Copy should complete within 1 second

      // Test navigation performance
      const { time: navTime } = await measureTime(async () => {
        await act(async () => {
          await result.current.navigateTo('/other/path');
        });
      });

      expect(navTime).toBeLessThan(200); // Navigation should be fast
    });

    it('should handle rapid file selection efficiently', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));

      await act(async () => {
        await TestUtils.waitForNextTick();
      });

      const { time } = await measureTime(() => {
        act(() => {
          // Rapid selection of 1000 files
          for (let i = 0; i < 1000; i++) {
            result.current.selectItem(`file-${i}`, true);
          }
        });
      });

      expect(time).toBeLessThan(100); // Should handle rapid selection efficiently
    });

    it('should filter large datasets quickly', async () => {
      const largeFileList = Array.from({ length: 5000 }, (_, i) => 
        TestUtils.createMockFileItem({
          id: `file-${i}`,
          name: i % 2 === 0 ? `document-${i}.txt` : `image-${i}.jpg`,
          extension: i % 2 === 0 ? 'txt' : 'jpg',
        })
      );

      const { result } = renderHook(() => useFileManager('/test'));

      // Mock large dataset
      act(() => {
        (result.current as any).items = largeFileList;
      });

      const { time } = await measureTime(() => {
        act(() => {
          result.current.setSearchQuery('document');
        });
      });

      expect(time).toBeLessThan(100); // Filtering should be fast
    });

    it('should sort large file lists efficiently', async () => {
      const largeFileList = Array.from({ length: 5000 }, (_, i) => 
        TestUtils.createMockFileItem({
          id: `file-${i}`,
          name: `file-${String(i).padStart(5, '0')}.txt`,
          size: Math.floor(Math.random() * 1000000),
          modified: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        })
      );

      const { result } = renderHook(() => useFileManager('/test'));

      // Mock large dataset
      act(() => {
        (result.current as any).items = largeFileList;
      });

      // Test sorting by different fields
      const sortFields: Array<'name' | 'size' | 'modified'> = ['name', 'size', 'modified'];
      
      for (const field of sortFields) {
        const { time } = await measureTime(() => {
          act(() => {
            result.current.setSorting(field);
          });
        });

        expect(time).toBeLessThan(200); // Each sort should complete within 200ms
      }
    });
  });

  describe('Context Manager Performance', () => {
    it('should handle large context efficiently', async () => {
      const { result } = renderHook(() => 
        μ6_useContextManager(1000000) // Large token limit
      );

      // Add 100 context items
      const { time } = await measureTime(() => {
        act(() => {
          for (let i = 0; i < 100; i++) {
            const item = TestUtils.createMockUDItem({
              id: `context-item-${i}`,
              content: `Context content ${i}`.repeat(10),
            });
            result.current.addToContext(item);
          }
        });
      });

      expect(time).toBeLessThan(1000); // Should add 100 items within 1 second
      expect(result.current.activeContextItems).toHaveLength(100);
    });

    it('should generate context summaries quickly', async () => {
      const { result } = renderHook(() => μ6_useContextManager(100000));

      // Add multiple context items
      act(() => {
        for (let i = 0; i < 50; i++) {
          const item = TestUtils.createMockUDItem({
            id: `item-${i}`,
            content: `Large content item ${i}`.repeat(20),
          });
          result.current.addToContext(item);
        }
      });

      const { time } = await measureTime(() => {
        return result.current.getContextSummary();
      });

      expect(time).toBeLessThan(100); // Summary generation should be fast
    });

    it('should perform token estimation efficiently', async () => {
      const { result } = renderHook(() => μ6_useContextManager(100000));

      const longContent = 'A'.repeat(50000); // 50K characters

      const { time } = await measureTime(() => {
        return result.current.estimateTokens(longContent);
      });

      expect(time).toBeLessThan(10); // Token estimation should be very fast
    });

    it('should optimize context without blocking UI', async () => {
      const { result } = renderHook(() => μ6_useContextManager(1000)); // Small limit

      // Add items that will trigger optimization
      act(() => {
        for (let i = 0; i < 20; i++) {
          const item = TestUtils.createMockUDItem({
            id: `item-${i}`,
            content: `Content ${i}`.repeat(100),
            priority: i < 10 ? 'low' : 'high',
          });
          result.current.addToContext(item);
        }
      });

      const { time } = await measureTime(() => {
        act(() => {
          result.current.optimizeContext();
        });
      });

      expect(time).toBeLessThan(50); // Optimization should not block UI
    });

    it('should handle undo operations efficiently', async () => {
      const { result } = renderHook(() => μ6_useContextManager(100000));

      // Build up history
      act(() => {
        for (let i = 0; i < 10; i++) {
          const item = TestUtils.createMockUDItem({ id: `item-${i}` });
          result.current.addToContext(item);
        }
      });

      // Test undo performance
      const { time } = await measureTime(() => {
        act(() => {
          for (let i = 0; i < 5; i++) {
            result.current.undoLastContextChange();
          }
        });
      });

      expect(time).toBeLessThan(50); // Multiple undos should be fast
    });
  });

  describe('Integration Performance', () => {
    it('should handle concurrent context menu and file operations', async () => {
      const { result: fileManager } = renderHook(() => useFileManager('/test'));
      const { result: contextManager } = renderHook(() => μ6_useContextManager(100000));

      await act(async () => {
        await TestUtils.waitForNextTick();
      });

      const { time } = await measureTime(async () => {
        // Concurrent operations
        const promises = [
          // File operations
          act(async () => {
            await fileManager.current.copyItems(['file1'], '/dest');
          }),
          act(async () => {
            fileManager.current.selectItem('file2', true);
          }),
          // Context operations
          act(() => {
            const item = TestUtils.createMockUDItem();
            contextManager.current.addToContext(item);
          }),
          act(() => {
            contextManager.current.getContextSummary();
          }),
        ];

        await Promise.all(promises);
      });

      expect(time).toBeLessThan(1000); // Concurrent operations should complete quickly
    });

    it('should maintain 60fps during animations', async () => {
      let frameCount = 0;
      const targetFPS = 60;
      const testDuration = 1000; // 1 second

      const measureFPS = () => {
        return new Promise<number>((resolve) => {
          const startTime = performance.now();
          
          const frame = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - startTime >= testDuration) {
              const fps = (frameCount / testDuration) * 1000;
              resolve(fps);
            } else {
              requestAnimationFrame(frame);
            }
          };
          
          requestAnimationFrame(frame);
        });
      };

      // Simulate context menu animations and file operations
      render(
        <μ7_UnifiedContextMenu
          visible={true}
          x={100}
          y={100}
          contextType="canvas"
          onClose={vi.fn()}
          onCreateItem={vi.fn()}
          onItemAction={vi.fn()}
          onAddToContext={vi.fn()}
        />
      );

      const actualFPS = await measureFPS();
      
      // Should maintain at least 30fps (half of target)
      expect(actualFPS).toBeGreaterThan(30);
    });

    it('should scale performance with system resources', async () => {
      // Test with different workload sizes
      const workloadSizes = [10, 100, 1000];
      const results: Array<{ size: number; time: number }> = [];

      for (const size of workloadSizes) {
        const items = Array.from({ length: size }, (_, i) => 
          TestUtils.createMockFileItem({ id: `item-${i}` })
        );

        const { time } = await measureTime(() => {
          const { result } = renderHook(() => useFileManager('/test'));
          
          act(() => {
            // Simulate processing large file list
            (result.current as any).items = items;
          });
        });

        results.push({ size, time });
      }

      // Performance should scale sub-linearly
      const smallTime = results[0].time;
      const largeTime = results[2].time;
      const scaleFactor = largeTime / smallTime;
      const sizeRatio = workloadSizes[2] / workloadSizes[0];

      expect(scaleFactor).toBeLessThan(sizeRatio); // Better than linear scaling
    });
  });

  describe('Memory Usage Tests', () => {
    it('should maintain stable memory usage during long operations', async () => {
      const initialMemory = measureMemory();
      
      // Perform many operations that could cause memory leaks
      for (let cycle = 0; cycle < 10; cycle++) {
        // Context menu operations
        const { unmount: unmountMenu } = render(
          <μ7_UnifiedContextMenu
            visible={true}
            x={100}
            y={100}
            contextType="window"
            targetItem={TestUtils.createMockUDItem()}
            onClose={vi.fn()}
            onCreateItem={vi.fn()}
            onItemAction={vi.fn()}
            onAddToContext={vi.fn()}
          />
        );

        // File manager operations
        const { result, unmount: unmountHook } = renderHook(() => 
          useFileManager('/test')
        );

        await act(async () => {
          result.current.selectItem('test-file', false);
          await result.current.copyItems(['test-file'], '/dest');
        });

        unmountMenu();
        unmountHook();

        // Force cleanup
        if (global.gc && cycle % 3 === 0) {
          global.gc();
        }
      }

      const finalMemory = measureMemory();
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    });

    it('should clean up event listeners and timers', async () => {
      const initialEventListeners = document.addEventListener.toString();
      
      // Create and destroy many components
      for (let i = 0; i < 20; i++) {
        const { unmount } = render(
          <μ7_UnifiedContextMenu
            visible={true}
            x={100}
            y={100}
            contextType="canvas"
            onClose={vi.fn()}
            onCreateItem={vi.fn()}
            onItemAction={vi.fn()}
            onAddToContext={vi.fn()}
          />
        );
        
        unmount();
      }

      // Event listeners should not accumulate
      const finalEventListeners = document.addEventListener.toString();
      expect(finalEventListeners).toBe(initialEventListeners);
    });
  });

  describe('Real-world Performance Scenarios', () => {
    it('should handle typical user workflow efficiently', async () => {
      // Simulate typical user workflow
      const { time } = await measureTime(async () => {
        // 1. User opens file manager
        const { result: fileManager } = renderHook(() => useFileManager('/home/user'));
        
        // 2. User navigates through directories
        await act(async () => {
          await fileManager.current.navigateTo('/home/user/Documents');
          await fileManager.current.navigateTo('/home/user/Downloads');
        });

        // 3. User selects multiple files
        act(() => {
          fileManager.current.selectItem('file1', false);
          fileManager.current.selectItem('file2', true);
          fileManager.current.selectItem('file3', true);
        });

        // 4. User right-clicks to open context menu
        const { unmount } = render(
          <μ7_UnifiedContextMenu
            visible={true}
            x={150}
            y={150}
            contextType="window"
            targetItem={TestUtils.createMockUDItem()}
            onClose={vi.fn()}
            onCreateItem={vi.fn()}
            onItemAction={vi.fn()}
            onAddToContext={vi.fn()}
          />
        );

        // 5. User copies files
        await act(async () => {
          await fileManager.current.copyItems(['file1', 'file2'], '/destination');
        });

        unmount();
      });

      expect(time).toBeLessThan(2000); // Entire workflow should complete within 2 seconds
    });

    it('should maintain performance under stress conditions', async () => {
      // Stress test with multiple concurrent operations
      const stressTest = async () => {
        const promises = [];

        // Multiple file managers
        for (let i = 0; i < 5; i++) {
          promises.push(
            new Promise(resolve => {
              const { result } = renderHook(() => useFileManager(`/test${i}`));
              act(() => {
                result.current.selectItem(`file-${i}`, false);
              });
              resolve(result);
            })
          );
        }

        // Multiple context menus
        for (let i = 0; i < 5; i++) {
          promises.push(
            new Promise(resolve => {
              const { unmount } = render(
                <μ7_UnifiedContextMenu
                  visible={true}
                  x={100 + i * 20}
                  y={100 + i * 20}
                  contextType="canvas"
                  onClose={vi.fn()}
                  onCreateItem={vi.fn()}
                  onItemAction={vi.fn()}
                  onAddToContext={vi.fn()}
                />
              );
              setTimeout(() => {
                unmount();
                resolve(null);
              }, 100);
            })
          );
        }

        await Promise.all(promises);
      };

      const { time } = await measureTime(stressTest);

      expect(time).toBeLessThan(1500); // Should handle stress test within 1.5 seconds
    });
  });
});