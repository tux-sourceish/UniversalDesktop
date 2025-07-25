// scripts/export-legacy-items.ts

/**
 * 🗄️ LEGACY EXPORT SCRIPT - UniversalDesktop v1 → v2 Migration
 * 
 * Exportiert alle Items aus der alten desktop_items Tabelle in das neue .ud Format
 * Basierend auf ANWEISUNG.md - Raimunds Bagua-System Integration
 * 
 * @version 2.1.0-raimund-algebra
 */

import { createClient } from '@supabase/supabase-js';
import { UDFormat } from '../src/core/UDFormat';
import * as fs from 'fs';

// Supabase Client Setup
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Legacy Item Interface (v1 Structure)
interface LegacyDesktopItem {
  id: string;
  type: 'notizzettel' | 'tabelle' | 'code' | 'browser' | 'terminal' | 'tui' | 'media' | 'chart' | 'calendar';
  title: string;
  content: any;
  position: { x: number; y: number; z: number };
  created_at: string;
  updated_at: string;
  user_id: string;
  metadata?: Record<string, any>;
  width?: number;
  height?: number;
  is_contextual?: boolean;
}

// Type Mapping: Legacy Types → Bagua ItemTypes
const mapLegacyTypeToBagua = (legacyType: string) => {
  const typeMap: Record<string, number> = {
    'code': UDFormat.ItemType.KONSTRUKTOR,     // ☰ HIMMEL - Templates/Classes
    'tabelle': UDFormat.ItemType.TABELLE,      // ☴ WIND - Views/UI  
    'notizzettel': UDFormat.ItemType.VARIABLE, // ☷ ERDE - Data/Storage
    'terminal': UDFormat.ItemType.EREIGNIS,    // ☳ DONNER - Events/Triggers
    'browser': UDFormat.ItemType.FUNKTION,     // ☲ FEUER - Functions
    'media': UDFormat.ItemType.FLUSS,          // ☵ WASSER - Streams/Media
    'tui': UDFormat.ItemType.INIT,             // ☶ BERG - Configuration
    'chart': UDFormat.ItemType.EIGENSCHAFT,    // ☱ SEE - Properties
    'calendar': UDFormat.ItemType.SYSTEM       // Extended System-level
  };
  
  return typeMap[legacyType] || UDFormat.ItemType.VORTEX;
};

// Bagua Descriptor Mapping
const mapTypeToBaguaDescriptor = (legacyType: string) => {
  const baguaMap: Record<string, number> = {
    'code': UDFormat.BAGUA.HIMMEL,      // ☰ Templates/Classes
    'tabelle': UDFormat.BAGUA.WIND,     // ☴ Views/UI
    'notizzettel': UDFormat.BAGUA.ERDE, // ☷ Global/Base
    'terminal': UDFormat.BAGUA.DONNER,  // ☳ Events
    'browser': UDFormat.BAGUA.FEUER,    // ☲ Functions
    'media': UDFormat.BAGUA.WASSER,     // ☵ Procedures/Flow
    'tui': UDFormat.BAGUA.BERG,         // ☶ Init/Setup
    'chart': UDFormat.BAGUA.SEE,        // ☱ Properties
    'calendar': UDFormat.BAGUA.ERDE     // Default to ERDE
  };
  
  return baguaMap[legacyType] || UDFormat.BAGUA.TAIJI;
};

async function exportLegacyItems() {
  console.log('🚀 Starting Legacy Items Export...');
  console.log('📡 Connecting to Supabase...');

  try {
    // Hole alle alten Items
    const { data: items, error } = await supabase
      .from('desktop_items')
      .select('*');

    if (error) {
      console.error('❌ Error fetching items from Supabase:', error);
      return;
    }

    if (!items || items.length === 0) {
      console.log('ℹ️  Keine Items zum Exportieren gefunden');
      return;
    }

    console.log(`📦 Found ${items.length} legacy items to export`);

    // Create UniversalDocument
    console.log('🌌 Creating UniversalDocument with Bagua-Power...');
    
    // For now, we'll create a simple document structure
    // TODO: Use actual UniversalDocument class when available
    const udDocument = {
      version: "2.1.0-raimund-algebra",
      created_at: Date.now(),
      metadata: {
        source: "legacy-export",
        bagua_system: "activated",
        export_timestamp: new Date().toISOString()
      },
      items: [] as any[]
    };

    // Convert each legacy item
    items.forEach((item: LegacyDesktopItem, index: number) => {
      console.log(`⚡ Processing item ${index + 1}/${items.length}: ${item.title}`);
      
      const udItem = {
        id: item.id,
        type: mapLegacyTypeToBagua(item.type),
        position: item.position || { x: 0, y: 0, z: 0 },
        content: item.content || {},
        title: item.title || 'Legacy Item',
        bagua_descriptor: mapTypeToBaguaDescriptor(item.type),
        dimensions: {
          width: item.width || 300,
          height: item.height || 200
        },
        metadata: {
          ...item.metadata,
          legacy_type: item.type,
          user_id: item.user_id,
          is_contextual: item.is_contextual || false,
          created_at: item.created_at,
          updated_at: item.updated_at
        },
        transformation_history: [{
          id: crypto.randomUUID(),
          verb: "archived",
          agent: "system:v1-legacy-export",
          description: `Exportiert aus v1 Datenbank (Type: ${item.type})`,
          timestamp: Date.now(),
          bagua_context: mapTypeToBaguaDescriptor(item.type)
        }]
      };

      udDocument.items.push(udItem);
    });

    // Erstelle backup Ordner falls nicht vorhanden
    if (!fs.existsSync('backup')) {
      fs.mkdirSync('backup');
      console.log('📁 Created backup directory');
    }

    // Speichere als .ud JSON (später als Binary)
    const filename = `backup/legacy-items-${new Date().toISOString().split('T')[0]}.ud.json`;
    fs.writeFileSync(filename, JSON.stringify(udDocument, null, 2));

    console.log(`✅ ${items.length} Items exportiert nach ${filename}`);
    console.log('🎮 Bagua-Descriptors verwendet:');
    
    // Statistics
    const baguaStats = udDocument.items.reduce((stats: Record<string, number>, item: any) => {
      const baguaName = Object.keys(UDFormat.BAGUA).find(key => 
        UDFormat.BAGUA[key as keyof typeof UDFormat.BAGUA] === item.bagua_descriptor
      ) || 'UNKNOWN';
      stats[baguaName] = (stats[baguaName] || 0) + 1;
      return stats;
    }, {});

    Object.entries(baguaStats).forEach(([bagua, count]) => {
      const symbol = getBaguaSymbol(bagua);
      console.log(`   ${symbol} ${bagua}: ${count} items`);
    });

    console.log('🌟 Export completed successfully! Raimund would be proud!');

  } catch (error) {
    console.error('💥 Export failed:', error);
  }
}

// Helper function to get Bagua symbols
function getBaguaSymbol(baguaName: string): string {
  const symbols: Record<string, string> = {
    'HIMMEL': '☰',
    'WIND': '☴', 
    'WASSER': '☵',
    'BERG': '☶',
    'SEE': '☱',
    'FEUER': '☲',
    'DONNER': '☳',
    'ERDE': '☷',
    'TAIJI': '☯'
  };
  return symbols[baguaName] || '❓';
}

// Run the export
if (require.main === module) {
  exportLegacyItems().catch(console.error);
}

export { exportLegacyItems };