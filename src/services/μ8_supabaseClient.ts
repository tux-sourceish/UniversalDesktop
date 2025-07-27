import { createClient } from '@supabase/supabase-js';

// Supabase configuration with fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: window.localStorage,
  },
});

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://mock-url.supabase.co' && supabaseAnonKey !== 'mock-key';
};

// Nexus' callback safety utility - prevents "callback is not defined" errors
const handleCallback = (callback?: Function) => {
  if (callback && typeof callback === 'function') {
    callback();
  }
};

// Mock authentication for development
export const mockAuth = {
  signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
    if (email === 'demo@universaldesktop.com' && password === 'demo123456') {
      const mockSession = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: 'demo-user-id',
          email: 'demo@universaldesktop.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
      
      // Store in localStorage for persistence
      localStorage.setItem('supabase.auth.token', JSON.stringify(mockSession));
      
      return { data: { session: mockSession }, error: null };
    }
    
    return { data: { session: null }, error: { message: 'Invalid credentials' } };
  },
  
  signUp: async ({ email, password: _password }: { email: string; password: string }) => {
    const mockUser = {
      id: 'user-' + Date.now(),
      email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const mockSession = {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      expires_in: 3600,
      token_type: 'bearer',
      user: mockUser,
    };
    
    localStorage.setItem('supabase.auth.token', JSON.stringify(mockSession));
    
    return { data: { user: mockUser, session: mockSession }, error: null };
  },
  
  signOut: async () => {
    localStorage.removeItem('supabase.auth.token');
    return { error: null };
  },
  
  getSession: async () => {
    const stored = localStorage.getItem('supabase.auth.token');
    if (stored) {
      try {
        const session = JSON.parse(stored);
        return { data: { session }, error: null };
      } catch {
        localStorage.removeItem('supabase.auth.token');
      }
    }
    return { data: { session: null }, error: null };
  },
  
  onAuthStateChange: (_callback: (event: string, session: any) => void) => {
    // Simple mock implementation
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    };
  }
};

// Initialize mock data if needed
const initMockData = () => {
  if (!isSupabaseConfigured() && !localStorage.getItem('mock_workspaces')) {
    const mockWorkspace = {
      id: 'demo-workspace-1',
      user_id: 'demo-user-id',
      name: 'Demo Workspace',
      description: 'Sample workspace for testing',
      ud_document: btoa('demo-binary-data'),
      ud_version: '2.1.0-raimund-algebra',
      bagua_descriptor: 256, // TAIJI
      item_count: 0,
      canvas_bounds: { minX: -2000, maxX: 2000, minY: -2000, maxY: 2000 },
      document_hash: '1234567890abcdef',
      revision_number: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
      settings: {
        minimap: { enabled: true, position: 'bottom-right' },
        bagua_colors: true,
        auto_save: true,
        context_zones: true
      },
      is_active: true
    };
    
    localStorage.setItem('mock_workspaces', JSON.stringify([mockWorkspace]));
    console.log('🎭 Mock workspace initialized');
  }
};

// Enhanced Supabase client with fallback
export const enhancedSupabase = {
  auth: {
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      if (!isSupabaseConfigured()) {
        return mockAuth.signInWithPassword(credentials);
      }
      return supabase.auth.signInWithPassword(credentials);
    },
    
    signUp: async (credentials: { email: string; password: string }) => {
      if (!isSupabaseConfigured()) {
        return mockAuth.signUp(credentials);
      }
      return supabase.auth.signUp(credentials);
    },
    
    signOut: async () => {
      if (!isSupabaseConfigured()) {
        return mockAuth.signOut();
      }
      return supabase.auth.signOut();
    },
    
    getSession: async () => {
      if (!isSupabaseConfigured()) {
        return mockAuth.getSession();
      }
      return supabase.auth.getSession();
    },
    
    onAuthStateChange: (_callback: (event: string, session: any) => void) => {
      if (!isSupabaseConfigured()) {
        return mockAuth.onAuthStateChange(_callback);
      }
      return supabase.auth.onAuthStateChange((event, session) => {
        handleCallback(() => _callback(event, session));
      });
    },
    
    getUser: async () => {
      if (!isSupabaseConfigured()) {
        const sessionResult = await mockAuth.getSession();
        return { 
          data: { user: sessionResult.data.session?.user || null }, 
          error: null 
        };
      }
      return supabase.auth.getUser();
    }
  },
  
  from: (table: string) => {
    if (!isSupabaseConfigured()) {
      // Initialize mock data on first access
      initMockData();
      // Advanced Mock Database with full Supabase-style chaining
      const mockQueryBuilder = {
        _filters: [] as any[],
        _select: '*',
        _order: null as any,
        _limit: null as number | null,
        _single: false,
        
        select: function(columns: string = '*') {
          this._select = columns;
          return this;
        },
        
        eq: function(field: string, value: any) {
          this._filters.push({ type: 'eq', field, value });
          return this;
        },
        
        order: function(field: string, options: { ascending?: boolean } = {}) {
          this._order = { field, ascending: options.ascending !== false };
          return this;
        },
        
        limit: function(count: number) {
          this._limit = count;
          return this;
        },
        
        single: function() {
          this._single = true;
          return this;
        },
        
        // Execute the query
        then: function(resolve: (value: any) => void) {
          const existing = JSON.parse(localStorage.getItem(`mock_${table}`) || '[]');
          
          // Apply filters
          let filtered = existing.filter((item: any) => {
            return this._filters.every(filter => {
              if (filter.type === 'eq') {
                return item[filter.field] === filter.value;
              }
              return true;
            });
          });
          
          // Apply ordering
          if (this._order) {
            filtered.sort((a: any, b: any) => {
              const aVal = a[this._order.field];
              const bVal = b[this._order.field];
              const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
              return this._order.ascending ? comparison : -comparison;
            });
          }
          
          // Apply limit
          if (this._limit) {
            filtered = filtered.slice(0, this._limit);
          }
          
          // Return single or array
          if (this._single) {
            const result = filtered.length > 0 ? filtered[0] : null;
            resolve({ data: result, error: null });
          } else {
            resolve({ data: filtered, error: null });
          }
        }
      };
      
      return {
        select: mockQueryBuilder.select.bind(mockQueryBuilder),
        insert: async (data: any) => {
          const existing = JSON.parse(localStorage.getItem(`mock_${table}`) || '[]');
          const newItem = { ...data, id: data.id || 'mock-' + Date.now() };
          existing.push(newItem);
          localStorage.setItem(`mock_${table}`, JSON.stringify(existing));
          return { data: newItem, error: null };
        },
        update: (data: any) => ({
          eq: (field: string, value: any) => {
            const existing = JSON.parse(localStorage.getItem(`mock_${table}`) || '[]');
            const updated = existing.map((item: any) => {
              if (item[field] === value) {
                return { ...item, ...data };
              }
              return item;
            });
            localStorage.setItem(`mock_${table}`, JSON.stringify(updated));
            return Promise.resolve({ data: updated, error: null });
          }
        }),
        delete: () => ({
          eq: (field: string, value: any) => {
            const existing = JSON.parse(localStorage.getItem(`mock_${table}`) || '[]');
            const filtered = existing.filter((item: any) => item[field] !== value);
            localStorage.setItem(`mock_${table}`, JSON.stringify(filtered));
            return Promise.resolve({ data: null, error: null });
          }
        })
      };
    }
    return supabase.from(table);
  }
};

export default enhancedSupabase;