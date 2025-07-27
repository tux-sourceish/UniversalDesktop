/**
 * 📊 DataModule - Data Loading & Persistence
 * Centralized data management for desktop items
 */

import { useState, useEffect, useCallback } from 'react';
import { enhancedSupabase } from '../services/μ8_supabaseClient';
import type { DesktopItemData } from '../types';

export interface DataModuleReturn {
  items: DesktopItemData[];
  loading: boolean;
  error: string | null;
  saveItem: (item: DesktopItemData) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateItem: (id: string, updates: Partial<DesktopItemData>) => Promise<void>;
  refreshItems: () => Promise<void>;
}

export const useDataModule = (userId?: string): DataModuleReturn => {
  const [items, setItems] = useState<DesktopItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load items from database
  const loadItems = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await enhancedSupabase
        .from('desktop_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setItems(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Save new item
  const saveItem = useCallback(async (item: DesktopItemData) => {
    try {
      const { error } = await enhancedSupabase
        .from('desktop_items')
        .insert(item);

      if (error) throw error;
      
      setItems(prev => [item, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item');
      console.error('Error saving item:', err);
    }
  }, []);

  // Delete item
  const deleteItem = useCallback(async (id: string) => {
    try {
      const { error } = await enhancedSupabase
        .from('desktop_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      console.error('Error deleting item:', err);
    }
  }, []);

  // Update item
  const updateItem = useCallback(async (id: string, updates: Partial<DesktopItemData>) => {
    try {
      const { error } = await enhancedSupabase
        .from('desktop_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
      console.error('Error updating item:', err);
    }
  }, []);

  // Refresh items
  const refreshItems = useCallback(async () => {
    await loadItems();
  }, [loadItems]);

  // Initial load
  useEffect(() => {
    if (userId) {
      loadItems();
    }
  }, [loadItems, userId]);

  return {
    items,
    loading,
    error,
    saveItem,
    deleteItem,
    updateItem,
    refreshItems
  };
};