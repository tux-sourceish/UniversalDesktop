/**
 * 🗄️ useDatabase - Intelligent Database Schema Hook
 * 
 * Provides type-safe database operations with automatic schema detection.
 * Handles table creation, migrations, and CRUD operations seamlessly.
 */

import { useState, useEffect, useCallback } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useSupabaseConfig } from './useSupabaseConfig';

interface DatabaseTable {
  name: string;
  columns: DatabaseColumn[];
  rowCount: number;
  lastModified: Date;
}

interface DatabaseColumn {
  name: string;
  type: string;
  nullable: boolean;
  default?: any;
}

interface DatabaseSchema {
  tables: DatabaseTable[];
  version: string;
  isReady: boolean;
}

interface DatabaseOperation {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete';
  data?: any;
  filters?: Record<string, any>;
  columns?: string[];
}

interface DatabaseReturn {
  schema: DatabaseSchema;
  client: SupabaseClient | null;
  loading: boolean;
  error: string | null;
  executeQuery: (operation: DatabaseOperation) => Promise<any>;
  createTable: (tableName: string, columns: DatabaseColumn[]) => Promise<boolean>;
  ensureDesktopTables: () => Promise<boolean>;
  getTableData: (tableName: string, limit?: number) => Promise<any[]>;
  healthCheck: () => Promise<boolean>;
}

export const useDatabase = (): DatabaseReturn => {
  const { config, loading: configLoading } = useSupabaseConfig();
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [schema, setSchema] = useState<DatabaseSchema>({
    tables: [],
    version: '1.0.0',
    isReady: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Supabase client
  const initializeClient = useCallback(async () => {
    if (!config.isValid || configLoading) return;

    try {
      const supabaseClient = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        db: {
          schema: 'public'
        }
      });

      setClient(supabaseClient);
      setError(null);
      
      console.log('🗄️ Database client initialized for:', config.environment);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize database client');
      console.error('Database initialization error:', err);
    }
  }, [config, configLoading]);

  // Health check
  const healthCheck = useCallback(async (): Promise<boolean> => {
    if (!client) return false;

    try {
      const { data, error } = await client
        .from('desktop_items')
        .select('id')
        .limit(1);

      if (error && error.code === 'PGRST116') {
        // Table doesn't exist, but connection is working
        return true;
      }

      return !error;
    } catch (err) {
      console.error('Health check failed:', err);
      return false;
    }
  }, [client]);

  // Load database schema
  const loadSchema = useCallback(async () => {
    if (!client) return;

    try {
      setLoading(true);
      
      // Get basic schema information
      const { data: tables, error } = await client
        .rpc('get_table_info', {});

      if (error) {
        console.warn('Schema detection failed, using default schema');
        // Use default schema for UniversalDesktop
        setSchema({
          tables: [
            {
              name: 'desktop_items',
              columns: [
                { name: 'id', type: 'uuid', nullable: false },
                { name: 'user_id', type: 'uuid', nullable: false },
                { name: 'type', type: 'text', nullable: false },
                { name: 'title', type: 'text', nullable: false },
                { name: 'content', type: 'jsonb', nullable: true },
                { name: 'position', type: 'jsonb', nullable: false },
                { name: 'metadata', type: 'jsonb', nullable: true },
                { name: 'created_at', type: 'timestamp', nullable: false },
                { name: 'updated_at', type: 'timestamp', nullable: false }
              ],
              rowCount: 0,
              lastModified: new Date()
            }
          ],
          version: '1.0.0',
          isReady: true
        });
      } else {
        setSchema({
          tables: tables || [],
          version: '1.0.0',
          isReady: true
        });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load database schema');
    } finally {
      setLoading(false);
    }
  }, [client]);

  // Ensure desktop tables exist
  const ensureDesktopTables = useCallback(async (): Promise<boolean> => {
    if (!client) return false;

    try {
      // Check if desktop_items table exists
      const { data, error } = await client
        .from('desktop_items')
        .select('id')
        .limit(1);

      if (error && error.code === 'PGRST116') {
        // Table doesn't exist, create it
        console.log('🔧 Creating desktop_items table...');
        
        const { error: createError } = await client.rpc('create_desktop_items_table');
        
        if (createError) {
          console.error('Failed to create desktop_items table:', createError);
          return false;
        }
        
        console.log('✅ Desktop tables created successfully');
      }

      return true;
    } catch (err) {
      console.error('Error ensuring desktop tables:', err);
      return false;
    }
  }, [client]);

  // Execute database operation
  const executeQuery = useCallback(async (operation: DatabaseOperation): Promise<any> => {
    if (!client) {
      throw new Error('Database client not initialized');
    }

    try {
      let query = client.from(operation.table);

      switch (operation.operation) {
        case 'select':
          if (operation.columns) {
            query = query.select(operation.columns.join(', '));
          } else {
            query = query.select('*');
          }
          
          if (operation.filters) {
            Object.entries(operation.filters).forEach(([key, value]) => {
              query = query.eq(key, value);
            });
          }
          break;

        case 'insert':
          if (!operation.data) {
            throw new Error('Insert operation requires data');
          }
          return await query.insert(operation.data);

        case 'update':
          if (!operation.data || !operation.filters) {
            throw new Error('Update operation requires data and filters');
          }
          Object.entries(operation.filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
          return await query.update(operation.data);

        case 'delete':
          if (!operation.filters) {
            throw new Error('Delete operation requires filters');
          }
          Object.entries(operation.filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
          return await query.delete();
      }

      return await query;
    } catch (err) {
      throw new Error(`Database operation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [client]);

  // Create table
  const createTable = useCallback(async (tableName: string, columns: DatabaseColumn[]): Promise<boolean> => {
    if (!client) return false;

    try {
      const columnDefinitions = columns.map(col => 
        `${col.name} ${col.type}${col.nullable ? '' : ' NOT NULL'}${col.default ? ` DEFAULT ${col.default}` : ''}`
      ).join(', ');

      const { error } = await client.rpc('create_table', {
        table_name: tableName,
        columns: columnDefinitions
      });

      if (error) {
        console.error(`Failed to create table ${tableName}:`, error);
        return false;
      }

      console.log(`✅ Table ${tableName} created successfully`);
      return true;
    } catch (err) {
      console.error(`Error creating table ${tableName}:`, err);
      return false;
    }
  }, [client]);

  // Get table data
  const getTableData = useCallback(async (tableName: string, limit: number = 100): Promise<any[]> => {
    if (!client) return [];

    try {
      const { data, error } = await client
        .from(tableName)
        .select('*')
        .limit(limit);

      if (error) {
        console.error(`Failed to fetch data from ${tableName}:`, error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error(`Error fetching data from ${tableName}:`, err);
      return [];
    }
  }, [client]);

  // Initialize client when config is ready
  useEffect(() => {
    if (config.isValid && !configLoading) {
      initializeClient();
    }
  }, [config, configLoading, initializeClient]);

  // Load schema when client is ready
  useEffect(() => {
    if (client) {
      loadSchema();
      ensureDesktopTables();
    }
  }, [client, loadSchema, ensureDesktopTables]);

  return {
    schema,
    client,
    loading: loading || configLoading,
    error,
    executeQuery,
    createTable,
    ensureDesktopTables,
    getTableData,
    healthCheck
  };
};