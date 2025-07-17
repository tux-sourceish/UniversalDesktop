import { createClient } from '@supabase/supabase-js';

// Supabase configuration with fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key-development';

// Create Supabase client only if URL is valid
let supabase: any = null;
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: window.localStorage,
    },
  });
} catch (error) {
  console.warn('🔧 Supabase client creation failed, using fallback mode:', error);
  supabase = null;
}

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabase !== null && 
         supabaseUrl !== 'https://demo.supabase.co' && 
         supabaseAnonKey !== 'demo-key-development';
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

// Enhanced Supabase client with fallback
export const enhancedSupabase = {
  auth: {
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      if (!isSupabaseConfigured() || !supabase) {
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
      // Return mock database operations
      return {
        select: () => ({ 
          eq: (field: string, value: any) => {
            const existing = JSON.parse(localStorage.getItem(`mock_${table}`) || '[]');
            const filtered = existing.filter((item: any) => item[field] === value);
            return { data: filtered, error: null };
          }
        }),
        insert: (data: any) => {
          const existing = JSON.parse(localStorage.getItem(`mock_${table}`) || '[]');
          existing.push(data);
          localStorage.setItem(`mock_${table}`, JSON.stringify(existing));
          return { data, error: null };
        },
        upsert: (data: any) => {
          const existing = JSON.parse(localStorage.getItem(`mock_${table}`) || '[]');
          const index = existing.findIndex((item: any) => item.id === data.id);
          if (index >= 0) {
            existing[index] = { ...existing[index], ...data };
          } else {
            existing.push(data);
          }
          localStorage.setItem(`mock_${table}`, JSON.stringify(existing));
          return { data, error: null };
        },
        delete: () => ({ 
          eq: (field: string, value: any) => ({
            eq: (field2: string, value2: any) => {
              const existing = JSON.parse(localStorage.getItem(`mock_${table}`) || '[]');
              const filtered = existing.filter((item: any) => 
                !(item[field] === value && item[field2] === value2)
              );
              localStorage.setItem(`mock_${table}`, JSON.stringify(filtered));
              return { data: filtered, error: null };
            }
          })
        })
      };
    }
    return supabase.from(table);
  }
};

export default enhancedSupabase;