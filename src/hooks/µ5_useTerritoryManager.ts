import { useState, useCallback, useMemo, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
  z: number;
}

interface DesktopItemData {
  id: string;
  type: string;
  title: string;
  position: Position;
  content: any;
  width?: number;
  height?: number;
  is_contextual?: boolean;
  metadata?: Record<string, any>;
}

interface Territory {
  id: string;
  name: string;
  bounds: { x: number; y: number; width: number; height: number };
  color: string;
  project: string;
  items: DesktopItemData[];
  createdAt: Date;
  lastAccessed: Date;
  metadata?: {
    density: number;
    itemTypes: Record<string, number>;
    contextualItems: number;
    averageItemSize: number;
  };
}

interface SpatialBookmark {
  id: string;
  name: string;
  position: Position;
  zoomLevel: number;
  context: string;
  timestamp: Date;
  territory?: string;
  metadata?: {
    itemCount: number;
    contextItems: number;
    screenshot?: string; // Base64 encoded mini-screenshot
  };
}

interface ClusteringResult {
  clusters: DesktopItemData[][];
  noise: DesktopItemData[];
  metrics: {
    totalClusters: number;
    averageClusterSize: number;
    largestCluster: number;
    clusteringEfficiency: number;
  };
}

interface TerritoryAnalytics {
  totalTerritories: number;
  totalItems: number;
  averageItemsPerTerritory: number;
  territoryDensity: number;
  mostActiveTerritory: Territory | null;
  territoryTypes: Record<string, number>;
}

export const µ5_useTerritoryManager = (
  items: DesktopItemData[] = [],
  canvasState?: { position: Position; scale: number }
) => {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [spatialBookmarks, setSpatialBookmarks] = useState<SpatialBookmark[]>([]);
  const [autoGroupingEnabled, setAutoGroupingEnabled] = useState(true);
  const [showTerritoryBoundaries, setShowTerritoryBoundaries] = useState(true);
  const [clusteringParams, setClusteringParams] = useState({
    epsilon: 500, // Distance threshold
    minPoints: 2,  // Minimum items for cluster
    densityThreshold: 0.001 // Items per pixel²
  });

  // DBSCAN Clustering Algorithm
  const calculateDBSCAN = useCallback((
    targetItems: DesktopItemData[], 
    epsilon: number = clusteringParams.epsilon, 
    minPoints: number = clusteringParams.minPoints
  ): ClusteringResult => {
    const visited = new Set<string>();
    const clusters: DesktopItemData[][] = [];
    const noise: DesktopItemData[] = [];

    const getNeighbors = (item: DesktopItemData): DesktopItemData[] => {
      return targetItems.filter(other => {
        if (other.id === item.id) return false;
        const dx = item.position.x - other.position.x;
        const dy = item.position.y - other.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= epsilon;
      });
    };

    const expandCluster = (item: DesktopItemData, neighbors: DesktopItemData[], cluster: DesktopItemData[]) => {
      cluster.push(item);
      visited.add(item.id);

      let i = 0;
      while (i < neighbors.length) {
        const neighbor = neighbors[i];
        
        if (!visited.has(neighbor.id)) {
          visited.add(neighbor.id);
          const neighborNeighbors = getNeighbors(neighbor);
          
          if (neighborNeighbors.length >= minPoints) {
            // Add new neighbors to the current neighborhood
            neighborNeighbors.forEach(nn => {
              if (!neighbors.some(n => n.id === nn.id)) {
                neighbors.push(nn);
              }
            });
          }
          
          // Add neighbor to cluster if it's not already in one
          if (!clusters.some(c => c.some(ci => ci.id === neighbor.id))) {
            cluster.push(neighbor);
          }
        }
        i++;
      }
    };

    // Main DBSCAN algorithm
    targetItems.forEach(item => {
      if (visited.has(item.id)) return;
      
      const neighbors = getNeighbors(item);
      
      if (neighbors.length < minPoints) {
        noise.push(item);
        return;
      }
      
      const cluster: DesktopItemData[] = [];
      expandCluster(item, neighbors, cluster);
      
      if (cluster.length > 0) {
        clusters.push(cluster);
      }
    });

    // Calculate metrics
    const totalClusters = clusters.length;
    const averageClusterSize = totalClusters > 0 ? 
      clusters.reduce((sum, cluster) => sum + cluster.length, 0) / totalClusters : 0;
    const largestCluster = totalClusters > 0 ? 
      Math.max(...clusters.map(cluster => cluster.length)) : 0;
    const clusteringEfficiency = targetItems.length > 0 ? 
      (targetItems.length - noise.length) / targetItems.length : 0;

    return {
      clusters,
      noise,
      metrics: {
        totalClusters,
        averageClusterSize,
        largestCluster,
        clusteringEfficiency
      }
    };
  }, [clusteringParams]);

  // Generate territory from cluster with enhanced metadata
  const generateTerritoryFromCluster = useCallback((cluster: DesktopItemData[], index: number): Territory => {
    const xs = cluster.map(item => item.position.x);
    const ys = cluster.map(item => item.position.y);
    const widths = cluster.map(item => item.width || 250);
    const heights = cluster.map(item => item.height || 200);
    
    const minX = Math.min(...xs) - 100;
    const maxX = Math.max(...xs.map((x, i) => x + widths[i])) + 100;
    const minY = Math.min(...ys) - 100;
    const maxY = Math.max(...ys.map((y, i) => y + heights[i])) + 100;
    
    const bounds = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };

    // Calculate territory metadata
    const itemTypes = cluster.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const contextualItems = cluster.filter(item => item.is_contextual).length;
    const totalArea = cluster.reduce((sum, item) => 
      sum + (item.width || 250) * (item.height || 200), 0
    );
    const averageItemSize = cluster.length > 0 ? totalArea / cluster.length : 0;
    const density = cluster.length / (bounds.width * bounds.height / 10000); // items per 100x100 area

    // Color assignment based on primary item type
    const primaryType = Object.entries(itemTypes).reduce((a, b) => 
      itemTypes[a[0]] > itemTypes[b[0]] ? a : b
    )[0];

    const colorMap: Record<string, string> = {
      notizzettel: '#1a7f56', // Ullrich Green
      tabelle: '#4a90e2',     // Sky Blue
      code: '#00bfff',        // Protoss Blue
      tui: '#6c7b7f',         // Concrete Gray
      browser: '#00ffcc',     // Energy Cyan
      media: '#ff8c00',       // Warning Orange
      chart: '#ffcc00',       // Premium Gold
      calendar: '#9932cc'     // Deep Purple
    };

    return {
      id: `territory_${Date.now()}_${index}`,
      name: `${primaryType.charAt(0).toUpperCase() + primaryType.slice(1)} Zone ${index + 1}`,
      bounds,
      color: colorMap[primaryType] || '#6c7b7f',
      project: `Project ${index + 1}`,
      items: cluster,
      createdAt: new Date(),
      lastAccessed: new Date(),
      metadata: {
        density,
        itemTypes,
        contextualItems,
        averageItemSize
      }
    };
  }, []);

  // Update territories with enhanced clustering
  const updateTerritories = useCallback(() => {
    if (!autoGroupingEnabled || items.length === 0) {
      setTerritories([]);
      return;
    }
    
    const clusteringResult = calculateDBSCAN(items);
    const newTerritories = clusteringResult.clusters.map((cluster, index) => 
      generateTerritoryFromCluster(cluster, index)
    );
    
    setTerritories(newTerritories);

    if (import.meta.env.DEV) {
      console.log('🏛️ Territories Updated:', {
        territories: newTerritories.length,
        totalItems: items.length,
        noise: clusteringResult.noise.length,
        efficiency: Math.round(clusteringResult.metrics.clusteringEfficiency * 100) + '%'
      });
    }
  }, [items, autoGroupingEnabled, calculateDBSCAN, generateTerritoryFromCluster]);

  // Create spatial bookmark with enhanced metadata
  const createSpatialBookmark = useCallback((
    name: string, 
    territory?: Territory,
    options?: { includeScreenshot?: boolean }
  ): SpatialBookmark => {
    const bookmark: SpatialBookmark = {
      id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      position: canvasState?.position || { x: 0, y: 0, z: 0 },
      zoomLevel: canvasState?.scale || 1,
      context: `${items.length} items`,
      timestamp: new Date(),
      territory: territory?.id,
      metadata: {
        itemCount: items.length,
        contextItems: items.filter(item => item.is_contextual).length,
        // screenshot: options?.includeScreenshot ? captureScreenshot() : undefined
      }
    };
    
    setSpatialBookmarks(prev => [...prev, bookmark]);
    
    if (import.meta.env.DEV) {
      console.log('📍 Bookmark Created:', {
        name,
        position: bookmark.position,
        zoom: Math.round(bookmark.zoomLevel * 100) + '%',
        territory: territory?.name
      });
    }
    
    return bookmark;
  }, [canvasState, items]);

  // Navigate to bookmark with smooth transition
  const navigateToBookmark = useCallback((bookmark: SpatialBookmark) => {
    // Update bookmark access time
    setSpatialBookmarks(prev => prev.map(b => 
      b.id === bookmark.id 
        ? { ...b, timestamp: new Date() }
        : b
    ));

    if (import.meta.env.DEV) {
      console.log('🧭 Navigating to Bookmark:', {
        name: bookmark.name,
        position: bookmark.position,
        zoom: Math.round(bookmark.zoomLevel * 100) + '%'
      });
    }

    return {
      position: bookmark.position,
      scale: bookmark.zoomLevel,
      territory: bookmark.territory
    };
  }, []);

  // Navigate to territory with optimal positioning
  const navigateToTerritory = useCallback((territory: Territory) => {
    const centerX = territory.bounds.x + territory.bounds.width / 2;
    const centerY = territory.bounds.y + territory.bounds.height / 2;
    
    // Calculate optimal zoom level based on territory size
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight - 80;
    
    const scaleX = viewportWidth / (territory.bounds.width + 200); // Add padding
    const scaleY = viewportHeight / (territory.bounds.height + 200);
    const optimalScale = Math.min(scaleX, scaleY, 1.0); // Don't zoom in too much
    
    const targetPosition = {
      x: -centerX * optimalScale + viewportWidth / 2,
      y: -centerY * optimalScale + viewportHeight / 2,
      z: 0
    };
    
    // Update territory access time
    setTerritories(prev => prev.map(t => 
      t.id === territory.id 
        ? { ...t, lastAccessed: new Date() }
        : t
    ));

    if (import.meta.env.DEV) {
      console.log('🏛️ Navigating to Territory:', {
        name: territory.name,
        items: territory.items.length,
        scale: Math.round(optimalScale * 100) + '%'
      });
    }

    return {
      position: targetPosition,
      scale: optimalScale,
      territory: territory.id
    };
  }, []);

  // Delete bookmark
  const deleteBookmark = useCallback((bookmarkId: string) => {
    setSpatialBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  }, []);

  // Rename territory
  const renameTerritory = useCallback((territoryId: string, newName: string) => {
    setTerritories(prev => prev.map(t => 
      t.id === territoryId ? { ...t, name: newName } : t
    ));
  }, []);

  // Get territory analytics
  const getTerritoryAnalytics = useCallback((): TerritoryAnalytics => {
    const totalItems = territories.reduce((sum, t) => sum + t.items.length, 0);
    const averageItemsPerTerritory = territories.length > 0 ? totalItems / territories.length : 0;
    
    const totalArea = territories.reduce((sum, t) => 
      sum + t.bounds.width * t.bounds.height, 0
    );
    const territoryDensity = totalArea > 0 ? totalItems / (totalArea / 10000) : 0;
    
    const mostActiveTerritory = territories.reduce((most, current) => {
      if (!most) return current;
      return current.lastAccessed > most.lastAccessed ? current : most;
    }, null as Territory | null);

    const territoryTypes = territories.reduce((acc, territory) => {
      const primaryType = Object.entries(territory.metadata?.itemTypes || {})
        .reduce((a, b) => a[1] > b[1] ? a : b, ['unknown', 0])[0];
      acc[primaryType] = (acc[primaryType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTerritories: territories.length,
      totalItems,
      averageItemsPerTerritory,
      territoryDensity,
      mostActiveTerritory,
      territoryTypes
    };
  }, [territories]);

  // Find territory containing position
  const findTerritoryAtPosition = useCallback((position: Position): Territory | null => {
    return territories.find(territory => {
      const { x, y, width, height } = territory.bounds;
      return position.x >= x && position.x <= x + width &&
             position.y >= y && position.y <= y + height;
    }) || null;
  }, [territories]);

  // Auto-update territories when items change (fixed infinite loop)
  useEffect(() => {
    const updateTimeout = setTimeout(() => {
      if (!autoGroupingEnabled || items.length === 0) {
        setTerritories([]);
        return;
      }
      
      const clusteringResult = calculateDBSCAN(items);
      const newTerritories = clusteringResult.clusters.map((cluster, index) => 
        generateTerritoryFromCluster(cluster, index)
      );
      
      setTerritories(newTerritories);

      if (import.meta.env.DEV) {
        console.log('🏛️ Territories Updated:', {
          territories: newTerritories.length,
          totalItems: items.length,
          noise: clusteringResult.noise.length,
          efficiency: Math.round(clusteringResult.metrics.clusteringEfficiency * 100) + '%'
        });
      }
    }, 300); // Debounce updates

    return () => clearTimeout(updateTimeout);
  }, [items, autoGroupingEnabled, calculateDBSCAN, generateTerritoryFromCluster]);

  // Memoized territory analytics for performance
  const analytics = useMemo(() => getTerritoryAnalytics(), [getTerritoryAnalytics]);

  return {
    // State
    territories,
    spatialBookmarks,
    autoGroupingEnabled,
    showTerritoryBoundaries,
    clusteringParams,
    analytics,

    // Territory Management
    updateTerritories,
    navigateToTerritory,
    renameTerritory,
    findTerritoryAtPosition,

    // Bookmark Management
    createSpatialBookmark,
    navigateToBookmark,
    deleteBookmark,

    // Settings
    setAutoGroupingEnabled,
    setShowTerritoryBoundaries,
    setClusteringParams,

    // Utilities
    calculateDBSCAN,
    getTerritoryAnalytics
  };
};