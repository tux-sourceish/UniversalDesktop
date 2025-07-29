/**
 * 🧪 Compatibility Tests: Tauri/Web Compatibility Layers
 * 
 * Tests for ensuring components work both in web browser and Tauri native environment
 * Testing file system operations, native integrations, and API abstractions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useFileManager } from '@/hooks/useFileManager';
import { TestUtils, TestConfig } from '../setup';

// Mock Tauri APIs
const mockTauriAPI = {
  fs: {
    readDir: vi.fn(),
    createDir: vi.fn(),
    removeFile: vi.fn(),
    copyFile: vi.fn(),
    renameFile: vi.fn(),
    exists: vi.fn(),
    readTextFile: vi.fn(),
    writeTextFile: vi.fn(),
    metadata: vi.fn(),
  },
  path: {
    join: vi.fn(),
    dirname: vi.fn(),
    basename: vi.fn(),
    extname: vi.fn(),
    resolve: vi.fn(),
  },
  dialog: {
    open: vi.fn(),
    save: vi.fn(),
    message: vi.fn(),
    ask: vi.fn(),
    confirm: vi.fn(),
  },
  clipboard: {
    readText: vi.fn(),
    writeText: vi.fn(),
  },
  shell: {
    open: vi.fn(),
  },
  window: {
    appWindow: {
      setTitle: vi.fn(),
      setSize: vi.fn(),
      center: vi.fn(),
      minimize: vi.fn(),
      maximize: vi.fn(),
      close: vi.fn(),
    },
  },
  app: {
    getVersion: vi.fn(),
    getName: vi.fn(),
    getTauriVersion: vi.fn(),
  },
  updater: {
    checkUpdate: vi.fn(),
    installUpdate: vi.fn(),
  },
};

// Mock the global __TAURI__ object
const mockTauri = {
  ...mockTauriAPI,
  convertFileSrc: vi.fn((path: string) => `tauri://localhost/${path}`),
};

declare global {
  var __TAURI__: typeof mockTauri;
  var __TAURI_METADATA__: any;
}

describe('Tauri/Web Compatibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up global mocks
    delete (global as any).__TAURI__;
    delete (global as any).__TAURI_METADATA__;
  });

  describe('Environment Detection', () => {
    it('should detect Tauri environment correctly', () => {
      // Mock Tauri environment
      (global as any).__TAURI__ = mockTauri;
      (global as any).__TAURI_METADATA__ = {
        __currentWindow: { label: 'main' },
        __windows: [{ label: 'main' }],
      };

      // Test environment detection
      const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;
      expect(isTauri).toBe(true);
    });

    it('should detect web environment correctly', () => {
      // Ensure no Tauri globals
      expect(typeof (global as any).__TAURI__).toBe('undefined');
      
      // Test environment detection
      const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;
      expect(isTauri).toBe(false);
    });

    it('should provide fallback APIs for web environment', () => {
      // Test that file manager works without Tauri APIs
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      expect(result.current).toBeDefined();
      expect(result.current.currentPath).toBe('/home/user');
      expect(typeof result.current.navigateTo).toBe('function');
    });
  });

  describe('File System Compatibility', () => {
    it('should use Tauri FS APIs when available', async () => {
      (global as any).__TAURI__ = mockTauri;
      
      // Mock successful file operations
      mockTauri.fs.readDir.mockResolvedValue([
        {
          name: 'test.txt',
          path: '/home/user/test.txt',
          children: undefined,
        },
        {
          name: 'folder',
          path: '/home/user/folder',
          children: [],
        },
      ]);

      const { result } = renderHook(() => useFileManager('/home/user'));

      await act(async () => {
        await result.current.navigateTo('/home/user');
      });

      // Should use Tauri API
      expect(mockTauri.fs.readDir).toHaveBeenCalledWith('/home/user');
    });

    it('should handle Tauri file system errors gracefully', async () => {
      (global as any).__TAURI__ = mockTauri;
      
      // Mock error
      mockTauri.fs.readDir.mockRejectedValue(new Error('Permission denied'));
      
      const onError = vi.fn();
      const { result } = renderHook(() => useFileManager('/restricted', undefined, onError));

      await act(async () => {
        await result.current.navigateTo('/restricted');
      });

      expect(onError).toHaveBeenCalledWith('Permission denied');
    });

    it('should fall back to web APIs when Tauri is not available', async () => {
      // No Tauri environment
      const { result } = renderHook(() => useFileManager('/home/user'));

      await act(async () => {
        await result.current.navigateTo('/home/user');
      });

      // Should use mock file system (web fallback)
      expect(result.current.items).toBeDefined();
    });

    it('should handle file operations consistently across platforms', async () => {
      const testCases = [
        { environment: 'tauri', hasTauri: true },
        { environment: 'web', hasTauri: false },
      ];

      for (const testCase of testCases) {
        if (testCase.hasTauri) {
          (global as any).__TAURI__ = mockTauri;
          mockTauri.fs.copyFile.mockResolvedValue(true);
        } else {
          delete (global as any).__TAURI__;
        }

        const { result } = renderHook(() => useFileManager('/home/user'));

        await act(async () => {
          await result.current.copyItems(['file1.txt'], '/destination');
        });

        // Should complete successfully regardless of environment
        expect(result.current.operations).toHaveLength(1);
        expect(result.current.operations[0].type).toBe('copy');

        // Cleanup
        if (testCase.hasTauri) {
          delete (global as any).__TAURI__;
        }
      }
    });
  });

  describe('Path Handling Compatibility', () => {
    it('should handle Windows paths in Tauri', () => {
      (global as any).__TAURI__ = mockTauri;
      mockTauri.path.join.mockImplementation((...parts) => parts.join('\\'));
      
      // Mock Windows environment
      Object.defineProperty(process, 'platform', {
        value: 'win32',
      });

      const { result } = renderHook(() => useFileManager('C:\\Users\\User'));

      expect(result.current.currentPath).toBe('C:\\Users\\User');
    });

    it('should handle Unix paths in web and Tauri', () => {
      const testPaths = ['/home/user', '/var/www', '/usr/local/bin'];

      testPaths.forEach(path => {
        const { result } = renderHook(() => useFileManager(path));
        expect(result.current.currentPath).toBe(path);
      });
    });

    it('should normalize paths correctly', () => {
      (global as any).__TAURI__ = mockTauri;
      mockTauri.path.resolve.mockImplementation((path) => 
        path.replace(/\\/g, '/').replace(/\/+/g, '/')
      );

      const { result } = renderHook(() => useFileManager('/home//user/../user/./documents'));

      // Should normalize the path
      expect(result.current.currentPath).toBe('/home/user/documents');
    });
  });

  describe('Dialog Integration', () => {
    it('should use Tauri dialogs when available', async () => {
      (global as any).__TAURI__ = mockTauri;
      mockTauri.dialog.open.mockResolvedValue('/selected/file.txt');

      // Simulate file selection dialog
      const fileSelector = async () => {
        if (typeof (global as any).__TAURI__ !== 'undefined') {
          return await mockTauri.dialog.open({
            multiple: false,
            filters: [{ name: 'Text Files', extensions: ['txt'] }],
          });
        }
        return null;
      };

      const selectedFile = await fileSelector();
      
      expect(mockTauri.dialog.open).toHaveBeenCalled();
      expect(selectedFile).toBe('/selected/file.txt');
    });

    it('should fall back to web file input when Tauri dialogs unavailable', async () => {
      // No Tauri environment
      const fileSelector = async () => {
        if (typeof (global as any).__TAURI__ !== 'undefined') {
          return await mockTauri.dialog.open();
        }
        
        // Web fallback
        return new Promise(resolve => {
          const input = document.createElement('input');
          input.type = 'file';
          input.onchange = () => resolve(input.files?.[0]?.name || null);
          input.click();
        });
      };

      // Mock file selection
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      const mockInput = document.createElement('input');
      mockInput.files = { 0: mockFile, length: 1 } as any;
      
      vi.spyOn(document, 'createElement').mockReturnValue(mockInput);

      const result = await fileSelector();
      expect(result).toBe('test.txt');
    });

    it('should handle confirmation dialogs consistently', async () => {
      const testCases = [
        { environment: 'tauri', hasTauri: true },
        { environment: 'web', hasTauri: false },
      ];

      for (const testCase of testCases) {
        if (testCase.hasTauri) {
          (global as any).__TAURI__ = mockTauri;
          mockTauri.dialog.confirm.mockResolvedValue(true);
        } else {
          delete (global as any).__TAURI__;
          vi.spyOn(window, 'confirm').mockReturnValue(true);
        }

        const confirmDialog = async (message: string) => {
          if (typeof (global as any).__TAURI__ !== 'undefined') {
            return await mockTauri.dialog.confirm(message);
          } else {
            return window.confirm(message);
          }
        };

        const result = await confirmDialog('Delete file?');
        expect(result).toBe(true);

        // Cleanup
        if (testCase.hasTauri) {
          delete (global as any).__TAURI__;
        } else {
          vi.restoreAllMocks();
        }
      }
    });
  });

  describe('Clipboard Integration', () => {
    it('should use Tauri clipboard when available', async () => {
      (global as any).__TAURI__ = mockTauri;
      mockTauri.clipboard.writeText.mockResolvedValue();
      mockTauri.clipboard.readText.mockResolvedValue('clipboard content');

      const clipboardManager = {
        write: async (text: string) => {
          if (typeof (global as any).__TAURI__ !== 'undefined') {
            await mockTauri.clipboard.writeText(text);
          } else {
            await navigator.clipboard.writeText(text);
          }
        },
        read: async () => {
          if (typeof (global as any).__TAURI__ !== 'undefined') {
            return await mockTauri.clipboard.readText();
          } else {
            return await navigator.clipboard.readText();
          }
        },
      };

      await clipboardManager.write('test content');
      expect(mockTauri.clipboard.writeText).toHaveBeenCalledWith('test content');

      const content = await clipboardManager.read();
      expect(content).toBe('clipboard content');
      expect(mockTauri.clipboard.readText).toHaveBeenCalled();
    });

    it('should fall back to web clipboard API', async () => {
      // Mock web clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
          readText: vi.fn().mockResolvedValue('web clipboard content'),
        },
      });

      const clipboardManager = {
        write: async (text: string) => {
          if (typeof (global as any).__TAURI__ !== 'undefined') {
            await mockTauri.clipboard.writeText(text);
          } else {
            await navigator.clipboard.writeText(text);
          }
        },
        read: async () => {
          if (typeof (global as any).__TAURI__ !== 'undefined') {
            return await mockTauri.clipboard.readText();
          } else {
            return await navigator.clipboard.readText();
          }
        },
      };

      await clipboardManager.write('web test content');
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('web test content');

      const content = await clipboardManager.read();
      expect(content).toBe('web clipboard content');
      expect(navigator.clipboard.readText).toHaveBeenCalled();
    });
  });

  describe('Window Management', () => {
    it('should control native window in Tauri', async () => {
      (global as any).__TAURI__ = mockTauri;
      mockTauri.window.appWindow.setTitle.mockResolvedValue();
      mockTauri.window.appWindow.setSize.mockResolvedValue();

      const windowManager = {
        setTitle: async (title: string) => {
          if (typeof (global as any).__TAURI__ !== 'undefined') {
            await mockTauri.window.appWindow.setTitle(title);
          } else {
            document.title = title;
          }
        },
        setSize: async (width: number, height: number) => {
          if (typeof (global as any).__TAURI__ !== 'undefined') {
            await mockTauri.window.appWindow.setSize({ width, height });
          } else {
            // Web fallback: no-op or use window.resizeTo if available
          }
        },
      };

      await windowManager.setTitle('File Manager');
      expect(mockTauri.window.appWindow.setTitle).toHaveBeenCalledWith('File Manager');

      await windowManager.setSize(800, 600);
      expect(mockTauri.window.appWindow.setSize).toHaveBeenCalledWith({ width: 800, height: 600 });
    });

    it('should handle web environment window operations', async () => {
      const windowManager = {
        setTitle: async (title: string) => {
          if (typeof (global as any).__TAURI__ !== 'undefined') {
            await mockTauri.window.appWindow.setTitle(title);
          } else {
            document.title = title;
          }
        },
      };

      await windowManager.setTitle('Web File Manager');
      expect(document.title).toBe('Web File Manager');
    });
  });

  describe('Shell Integration', () => {
    it('should open files with system default app in Tauri', async () => {
      (global as any).__TAURI__ = mockTauri;
      mockTauri.shell.open.mockResolvedValue();

      const openFile = async (path: string) => {
        if (typeof (global as any).__TAURI__ !== 'undefined') {
          await mockTauri.shell.open(path);
        } else {
          // Web fallback: download or display file
          const link = document.createElement('a');
          link.href = path;
          link.target = '_blank';
          link.click();
        }
      };

      await openFile('/home/user/document.pdf');
      expect(mockTauri.shell.open).toHaveBeenCalledWith('/home/user/document.pdf');
    });

    it('should handle web fallback for file opening', async () => {
      vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'a') {
          return {
            href: '',
            target: '',
            click: vi.fn(),
          } as any;
        }
        return document.createElement(tagName);
      });

      const openFile = async (path: string) => {
        if (typeof (global as any).__TAURI__ !== 'undefined') {
          await mockTauri.shell.open(path);
        } else {
          const link = document.createElement('a');
          link.href = path;
          link.target = '_blank';
          link.click();
        }
      };

      await openFile('https://example.com/document.pdf');
      
      const mockLink = document.createElement('a') as any;
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  describe('App Metadata and Updates', () => {
    it('should get app version from Tauri', async () => {
      (global as any).__TAURI__ = mockTauri;
      mockTauri.app.getVersion.mockResolvedValue('1.0.0');

      const getVersion = async () => {
        if (typeof (global as any).__TAURI__ !== 'undefined') {
          return await mockTauri.app.getVersion();
        } else {
          return process.env.PACKAGE_VERSION || '1.0.0-web';
        }
      };

      const version = await getVersion();
      expect(version).toBe('1.0.0');
      expect(mockTauri.app.getVersion).toHaveBeenCalled();
    });

    it('should handle updates in Tauri environment', async () => {
      (global as any).__TAURI__ = mockTauri;
      mockTauri.updater.checkUpdate.mockResolvedValue({
        shouldUpdate: true,
        manifest: { version: '1.1.0' },
      });

      const checkForUpdates = async () => {
        if (typeof (global as any).__TAURI__ !== 'undefined') {
          return await mockTauri.updater.checkUpdate();
        } else {
          // Web apps typically handle updates differently
          return { shouldUpdate: false };
        }
      };

      const updateInfo = await checkForUpdates();
      expect(updateInfo.shouldUpdate).toBe(true);
      expect(mockTauri.updater.checkUpdate).toHaveBeenCalled();
    });
  });

  describe('Resource Handling', () => {
    it('should convert file paths for Tauri asset serving', () => {
      (global as any).__TAURI__ = mockTauri;
      mockTauri.convertFileSrc.mockImplementation((path) => `tauri://localhost/${path}`);

      const convertPath = (filePath: string) => {
        if (typeof (global as any).__TAURI__ !== 'undefined') {
          return mockTauri.convertFileSrc(filePath);
        } else {
          // Web: return path as-is or convert to blob URL
          return filePath;
        }
      };

      const tauriPath = convertPath('/home/user/image.png');
      expect(tauriPath).toBe('tauri://localhost//home/user/image.png');
      expect(mockTauri.convertFileSrc).toHaveBeenCalledWith('/home/user/image.png');
    });

    it('should handle web resource paths', () => {
      const convertPath = (filePath: string) => {
        if (typeof (global as any).__TAURI__ !== 'undefined') {
          return mockTauri.convertFileSrc(filePath);
        } else {
          return filePath;
        }
      };

      const webPath = convertPath('/assets/image.png');
      expect(webPath).toBe('/assets/image.png');
    });
  });

  describe('Error Handling and Fallbacks', () => {
    it('should handle Tauri API failures gracefully', async () => {
      (global as any).__TAURI__ = mockTauri;
      mockTauri.fs.readDir.mockRejectedValue(new Error('File system error'));

      const { result } = renderHook(() => useFileManager('/home/user'));

      await act(async () => {
        try {
          await result.current.navigateTo('/failing/path');
        } catch (error) {
          // Should handle error gracefully
        }
      });

      // Should not crash and provide error state
      expect(result.current.error).toBeTruthy();
    });

    it('should provide meaningful error messages across platforms', async () => {
      const testCases = [
        {
          environment: 'tauri',
          setup: () => {
            (global as any).__TAURI__ = mockTauri;
            mockTauri.fs.readDir.mockRejectedValue(new Error('Permission denied'));
          },
          expectedError: 'Permission denied',
        },
        {
          environment: 'web',
          setup: () => {
            delete (global as any).__TAURI__;
            // Web fallback would have its own error
          },
          expectedError: 'Failed to load directory', // Web fallback error
        },
      ];

      for (const testCase of testCases) {
        testCase.setup();

        const onError = vi.fn();
        const { result } = renderHook(() => useFileManager('/test', undefined, onError));

        await act(async () => {
          await result.current.navigateTo('/failing/path');
        });

        expect(onError).toHaveBeenCalledWith(expect.stringContaining(testCase.expectedError));
      }
    });

    it('should maintain functionality when some APIs are unavailable', async () => {
      (global as any).__TAURI__ = {
        // Only provide partial Tauri API
        fs: {
          readDir: mockTauri.fs.readDir,
          // Missing other fs methods
        },
      };

      const { result } = renderHook(() => useFileManager('/home/user'));

      // Should still work with available APIs
      await act(async () => {
        await result.current.navigateTo('/home/user');
      });

      expect(result.current.currentPath).toBe('/home/user');

      // Operations requiring missing APIs should fallback gracefully
      await act(async () => {
        await result.current.copyItems(['file1'], '/destination');
      });

      // Should complete with appropriate status
      expect(result.current.operations).toHaveLength(1);
    });
  });

  describe('Performance Considerations', () => {
    it('should detect and optimize for native environment', async () => {
      (global as any).__TAURI__ = mockTauri;

      const { result } = renderHook(() => useFileManager('/home/user'));

      const startTime = performance.now();
      
      await act(async () => {
        // Perform operations that benefit from native APIs
        await result.current.navigateTo('/home/user');
        result.current.selectItem('file1', false);
        await result.current.copyItems(['file1'], '/destination');
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Native operations should be reasonably fast
      expect(executionTime).toBeLessThan(1000);
    });

    it('should maintain acceptable performance in web environment', async () => {
      // No Tauri environment
      const { result } = renderHook(() => useFileManager('/home/user'));

      const startTime = performance.now();
      
      await act(async () => {
        await result.current.navigateTo('/home/user');
        result.current.selectItem('file1', false);
        await result.current.copyItems(['file1'], '/destination');
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Web fallbacks should still be reasonably fast
      expect(executionTime).toBeLessThan(2000);
    });
  });
});