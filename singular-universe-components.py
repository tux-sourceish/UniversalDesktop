#!/usr/bin/env python3
"""
SingularUniverse Backend Utilities
Enhanced backend components extracted from the SingularUniverse project analysis.
"""

import asyncio
import json
import time
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, asdict
from enum import Enum
from abc import ABC, abstractmethod
import logging
from datetime import datetime
import hashlib
import sqlite3
import threading
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ComponentType(Enum):
    """Desktop component types"""
    NOTIZZETTEL = "notizzettel"
    TABELLE = "tabelle"
    CODE = "code"
    BROWSER = "browser"
    TERMINAL = "terminal"
    MEDIA = "media"
    CHART = "chart"
    CALENDAR = "calendar"

class ThemeType(Enum):
    """Available theme types"""
    QUANTUM = "quantum"
    NATURE = "nature"
    INDUSTRIAL = "industrial"
    ART_DECO = "artdeco"

@dataclass
class Position:
    """2D position with optional z-index"""
    x: float
    y: float
    z: int = 0

@dataclass
class DesktopItem:
    """Desktop item data structure"""
    id: str
    type: ComponentType
    title: str
    position: Position
    content: Any
    created_at: datetime
    updated_at: datetime
    user_id: str
    metadata: Dict[str, Any] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'type': self.type.value,
            'title': self.title,
            'position': asdict(self.position),
            'content': self.content,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'user_id': self.user_id,
            'metadata': self.metadata or {}
        }

# =============================================================================
# DATABASE LAYER (Enhanced from supabaseClient.ts patterns)
# =============================================================================

class DatabaseBridge(ABC):
    """Abstract database bridge interface"""
    
    @abstractmethod
    async def save_item(self, item: DesktopItem) -> bool:
        """Save a desktop item"""
        pass
    
    @abstractmethod
    async def load_items(self, user_id: str) -> List[DesktopItem]:
        """Load all items for a user"""
        pass
    
    @abstractmethod
    async def update_item(self, item: DesktopItem) -> bool:
        """Update an existing item"""
        pass
    
    @abstractmethod
    async def delete_item(self, item_id: str, user_id: str) -> bool:
        """Delete an item"""
        pass

class MockDatabaseBridge(DatabaseBridge):
    """Mock database bridge with in-memory storage (fallback system)"""
    
    def __init__(self):
        self.items: Dict[str, DesktopItem] = {}
        self.lock = threading.Lock()
        logger.info("MockDatabaseBridge initialized - fallback mode active")
    
    async def save_item(self, item: DesktopItem) -> bool:
        """Save item to memory"""
        try:
            with self.lock:
                self.items[item.id] = item
                logger.info(f"Saved item {item.id} to memory")
                return True
        except Exception as e:
            logger.error(f"Error saving item {item.id}: {e}")
            return False
    
    async def load_items(self, user_id: str) -> List[DesktopItem]:
        """Load items from memory for user"""
        try:
            with self.lock:
                user_items = [item for item in self.items.values() if item.user_id == user_id]
                logger.info(f"Loaded {len(user_items)} items for user {user_id}")
                return user_items
        except Exception as e:
            logger.error(f"Error loading items for user {user_id}: {e}")
            return []
    
    async def update_item(self, item: DesktopItem) -> bool:
        """Update item in memory"""
        try:
            with self.lock:
                if item.id in self.items:
                    item.updated_at = datetime.now()
                    self.items[item.id] = item
                    logger.info(f"Updated item {item.id}")
                    return True
                return False
        except Exception as e:
            logger.error(f"Error updating item {item.id}: {e}")
            return False
    
    async def delete_item(self, item_id: str, user_id: str) -> bool:
        """Delete item from memory"""
        try:
            with self.lock:
                if item_id in self.items and self.items[item_id].user_id == user_id:
                    del self.items[item_id]
                    logger.info(f"Deleted item {item_id}")
                    return True
                return False
        except Exception as e:
            logger.error(f"Error deleting item {item_id}: {e}")
            return False

class SqliteDatabaseBridge(DatabaseBridge):
    """SQLite database bridge for local storage"""
    
    def __init__(self, db_path: str = "universal_desktop.db"):
        self.db_path = db_path
        self.lock = threading.Lock()
        self._init_database()
        logger.info(f"SqliteDatabaseBridge initialized with {db_path}")
    
    def _init_database(self):
        """Initialize database tables"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS desktop_items (
                    id TEXT PRIMARY KEY,
                    type TEXT NOT NULL,
                    title TEXT NOT NULL,
                    position_x REAL NOT NULL,
                    position_y REAL NOT NULL,
                    position_z INTEGER DEFAULT 0,
                    content TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    metadata TEXT
                )
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_user_items ON desktop_items(user_id)
            """)
            conn.commit()
    
    async def save_item(self, item: DesktopItem) -> bool:
        """Save item to SQLite"""
        try:
            with self.lock:
                with sqlite3.connect(self.db_path) as conn:
                    conn.execute("""
                        INSERT OR REPLACE INTO desktop_items 
                        (id, type, title, position_x, position_y, position_z, content, 
                         created_at, updated_at, user_id, metadata)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        item.id, item.type.value, item.title,
                        item.position.x, item.position.y, item.position.z,
                        json.dumps(item.content), item.created_at.isoformat(),
                        item.updated_at.isoformat(), item.user_id,
                        json.dumps(item.metadata or {})
                    ))
                    conn.commit()
                    logger.info(f"Saved item {item.id} to SQLite")
                    return True
        except Exception as e:
            logger.error(f"Error saving item {item.id} to SQLite: {e}")
            return False
    
    async def load_items(self, user_id: str) -> List[DesktopItem]:
        """Load items from SQLite for user"""
        try:
            with self.lock:
                with sqlite3.connect(self.db_path) as conn:
                    cursor = conn.execute("""
                        SELECT id, type, title, position_x, position_y, position_z,
                               content, created_at, updated_at, user_id, metadata
                        FROM desktop_items WHERE user_id = ?
                        ORDER BY created_at DESC
                    """, (user_id,))
                    
                    items = []
                    for row in cursor.fetchall():
                        item = DesktopItem(
                            id=row[0],
                            type=ComponentType(row[1]),
                            title=row[2],
                            position=Position(x=row[3], y=row[4], z=row[5]),
                            content=json.loads(row[6]) if row[6] else None,
                            created_at=datetime.fromisoformat(row[7]),
                            updated_at=datetime.fromisoformat(row[8]),
                            user_id=row[9],
                            metadata=json.loads(row[10]) if row[10] else {}
                        )
                        items.append(item)
                    
                    logger.info(f"Loaded {len(items)} items for user {user_id}")
                    return items
        except Exception as e:
            logger.error(f"Error loading items for user {user_id}: {e}")
            return []
    
    async def update_item(self, item: DesktopItem) -> bool:
        """Update item in SQLite"""
        item.updated_at = datetime.now()
        return await self.save_item(item)
    
    async def delete_item(self, item_id: str, user_id: str) -> bool:
        """Delete item from SQLite"""
        try:
            with self.lock:
                with sqlite3.connect(self.db_path) as conn:
                    cursor = conn.execute("""
                        DELETE FROM desktop_items WHERE id = ? AND user_id = ?
                    """, (item_id, user_id))
                    conn.commit()
                    
                    if cursor.rowcount > 0:
                        logger.info(f"Deleted item {item_id}")
                        return True
                    return False
        except Exception as e:
            logger.error(f"Error deleting item {item_id}: {e}")
            return False

# =============================================================================
# DEBOUNCED SAVE SYSTEM (Enhanced from App.tsx patterns)
# =============================================================================

class DebouncedSaveManager:
    """Debounced save manager for performance optimization"""
    
    def __init__(self, db_bridge: DatabaseBridge, debounce_delay: float = 0.5):
        self.db_bridge = db_bridge
        self.debounce_delay = debounce_delay
        self.save_queue: Dict[str, DesktopItem] = {}
        self.save_timer: Optional[asyncio.Task] = None
        self.lock = asyncio.Lock()
        logger.info(f"DebouncedSaveManager initialized with {debounce_delay}s delay")
    
    async def queue_save(self, item: DesktopItem):
        """Queue an item for debounced saving"""
        async with self.lock:
            self.save_queue[item.id] = item
            
            # Cancel existing timer
            if self.save_timer and not self.save_timer.done():
                self.save_timer.cancel()
            
            # Start new timer
            self.save_timer = asyncio.create_task(self._process_save_queue())
    
    async def _process_save_queue(self):
        """Process the save queue after debounce delay"""
        try:
            await asyncio.sleep(self.debounce_delay)
            
            async with self.lock:
                if not self.save_queue:
                    return
                
                items_to_save = list(self.save_queue.values())
                self.save_queue.clear()
                
                logger.info(f"Processing {len(items_to_save)} queued saves")
                
                # Save items in parallel
                tasks = [self.db_bridge.save_item(item) for item in items_to_save]
                results = await asyncio.gather(*tasks, return_exceptions=True)
                
                successes = sum(1 for r in results if r is True)
                logger.info(f"Saved {successes}/{len(items_to_save)} items successfully")
                
        except asyncio.CancelledError:
            logger.debug("Save queue processing cancelled")
        except Exception as e:
            logger.error(f"Error processing save queue: {e}")
    
    async def force_save(self):
        """Force immediate save of all queued items"""
        if self.save_timer and not self.save_timer.done():
            self.save_timer.cancel()
        
        await self._process_save_queue()

# =============================================================================
# AI INTEGRATION LAYER (Enhanced from geminiService.ts and archon patterns)
# =============================================================================

class AIProvider(ABC):
    """Abstract AI provider interface"""
    
    @abstractmethod
    async def generate_code(self, prompt: str) -> str:
        """Generate code from prompt"""
        pass
    
    @abstractmethod
    async def generate_content(self, prompt: str, content_type: str) -> Any:
        """Generate content of specific type"""
        pass

class MockAIProvider(AIProvider):
    """Mock AI provider for testing"""
    
    async def generate_code(self, prompt: str) -> str:
        """Generate mock code"""
        await asyncio.sleep(0.5)  # Simulate API delay
        return f"""
# Generated code for: {prompt}
class GeneratedClass:
    def __init__(self):
        self.prompt = "{prompt}"
    
    def execute(self):
        return f"Executing: {{self.prompt}}"

# Usage example
instance = GeneratedClass()
result = instance.execute()
print(result)
"""
    
    async def generate_content(self, prompt: str, content_type: str) -> Any:
        """Generate mock content"""
        await asyncio.sleep(0.3)
        
        if content_type == "table":
            return [
                ["ID", "Name", "Status"],
                ["1", f"Item from {prompt}", "Active"],
                ["2", f"Another item", "Pending"]
            ]
        elif content_type == "note":
            return f"Generated note:\n\n{prompt}\n\nThis is a mock response."
        else:
            return f"Generated {content_type}: {prompt}"

class MultiProviderAI:
    """Multi-provider AI system with fallbacks (inspired by litellm)"""
    
    def __init__(self, providers: List[AIProvider]):
        self.providers = providers
        self.current_provider = 0
        logger.info(f"MultiProviderAI initialized with {len(providers)} providers")
    
    async def generate_code(self, prompt: str) -> str:
        """Generate code with fallback support"""
        for i, provider in enumerate(self.providers):
            try:
                result = await provider.generate_code(prompt)
                if i != self.current_provider:
                    logger.info(f"Switched to provider {i} for code generation")
                    self.current_provider = i
                return result
            except Exception as e:
                logger.warning(f"Provider {i} failed for code generation: {e}")
                continue
        
        raise Exception("All AI providers failed")
    
    async def generate_content(self, prompt: str, content_type: str) -> Any:
        """Generate content with fallback support"""
        for i, provider in enumerate(self.providers):
            try:
                result = await provider.generate_content(prompt, content_type)
                if i != self.current_provider:
                    logger.info(f"Switched to provider {i} for content generation")
                    self.current_provider = i
                return result
            except Exception as e:
                logger.warning(f"Provider {i} failed for content generation: {e}")
                continue
        
        raise Exception("All AI providers failed")

# =============================================================================
# INFINITE CANVAS SYSTEM (Backend support for frontend canvas)
# =============================================================================

@dataclass
class CanvasState:
    """Canvas state for infinite desktop"""
    position: Position
    scale: float
    velocity: Position
    scale_velocity: float
    bounds: Optional[Dict[str, float]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'position': asdict(self.position),
            'scale': self.scale,
            'velocity': asdict(self.velocity),
            'scale_velocity': self.scale_velocity,
            'bounds': self.bounds
        }

class CanvasManager:
    """Backend canvas state management"""
    
    def __init__(self):
        self.canvas_states: Dict[str, CanvasState] = {}
        self.lock = threading.Lock()
        logger.info("CanvasManager initialized")
    
    def get_canvas_state(self, user_id: str) -> CanvasState:
        """Get canvas state for user"""
        with self.lock:
            if user_id not in self.canvas_states:
                self.canvas_states[user_id] = CanvasState(
                    position=Position(0, 0),
                    scale=1.0,
                    velocity=Position(0, 0),
                    scale_velocity=0.0
                )
            return self.canvas_states[user_id]
    
    def update_canvas_state(self, user_id: str, state: CanvasState):
        """Update canvas state for user"""
        with self.lock:
            self.canvas_states[user_id] = state
            logger.debug(f"Updated canvas state for user {user_id}")
    
    def get_visible_items(self, user_id: str, items: List[DesktopItem], 
                         viewport_width: float, viewport_height: float) -> List[DesktopItem]:
        """Get items visible in current viewport"""
        canvas_state = self.get_canvas_state(user_id)
        
        # Calculate viewport bounds
        left = canvas_state.position.x - viewport_width / (2 * canvas_state.scale)
        right = canvas_state.position.x + viewport_width / (2 * canvas_state.scale)
        top = canvas_state.position.y - viewport_height / (2 * canvas_state.scale)
        bottom = canvas_state.position.y + viewport_height / (2 * canvas_state.scale)
        
        # Filter items within viewport
        visible_items = []
        for item in items:
            if (left <= item.position.x <= right and 
                top <= item.position.y <= bottom):
                visible_items.append(item)
        
        logger.debug(f"Found {len(visible_items)}/{len(items)} visible items")
        return visible_items

# =============================================================================
# DESKTOP MANAGER (Main orchestrator)
# =============================================================================

class DesktopManager:
    """Main desktop manager orchestrating all components"""
    
    def __init__(self, db_bridge: DatabaseBridge = None, ai_provider: AIProvider = None):
        self.db_bridge = db_bridge or MockDatabaseBridge()
        self.ai_provider = ai_provider or MockAIProvider()
        self.save_manager = DebouncedSaveManager(self.db_bridge)
        self.canvas_manager = CanvasManager()
        self.event_handlers: Dict[str, List[Callable]] = {}
        logger.info("DesktopManager initialized")
    
    def add_event_handler(self, event_type: str, handler: Callable):
        """Add event handler"""
        if event_type not in self.event_handlers:
            self.event_handlers[event_type] = []
        self.event_handlers[event_type].append(handler)
    
    async def emit_event(self, event_type: str, data: Any):
        """Emit event to all handlers"""
        if event_type in self.event_handlers:
            for handler in self.event_handlers[event_type]:
                try:
                    await handler(data)
                except Exception as e:
                    logger.error(f"Error in event handler for {event_type}: {e}")
    
    async def create_item(self, user_id: str, item_type: ComponentType, 
                         title: str, position: Position, content: Any = None) -> DesktopItem:
        """Create new desktop item"""
        item_id = hashlib.md5(f"{user_id}_{time.time()}".encode()).hexdigest()
        
        item = DesktopItem(
            id=item_id,
            type=item_type,
            title=title,
            position=position,
            content=content or self._get_default_content(item_type),
            created_at=datetime.now(),
            updated_at=datetime.now(),
            user_id=user_id
        )
        
        await self.save_manager.queue_save(item)
        await self.emit_event("item_created", item)
        
        logger.info(f"Created {item_type.value} item {item_id} for user {user_id}")
        return item
    
    async def update_item(self, item: DesktopItem):
        """Update existing item"""
        await self.save_manager.queue_save(item)
        await self.emit_event("item_updated", item)
        logger.info(f"Updated item {item.id}")
    
    async def delete_item(self, item_id: str, user_id: str):
        """Delete item"""
        success = await self.db_bridge.delete_item(item_id, user_id)
        if success:
            await self.emit_event("item_deleted", {"id": item_id, "user_id": user_id})
            logger.info(f"Deleted item {item_id}")
        return success
    
    async def load_user_items(self, user_id: str) -> List[DesktopItem]:
        """Load all items for user"""
        items = await self.db_bridge.load_items(user_id)
        await self.emit_event("items_loaded", {"user_id": user_id, "items": items})
        return items
    
    async def generate_ai_content(self, user_id: str, prompt: str, 
                                 content_type: str, position: Position) -> DesktopItem:
        """Generate AI content as desktop item"""
        try:
            if content_type == "code":
                content = await self.ai_provider.generate_code(prompt)
                item_type = ComponentType.CODE
            else:
                content = await self.ai_provider.generate_content(prompt, content_type)
                item_type = ComponentType.NOTIZZETTEL if content_type == "note" else ComponentType.TABELLE
            
            item = await self.create_item(
                user_id=user_id,
                item_type=item_type,
                title=f"AI: {prompt[:50]}...",
                position=position,
                content=content
            )
            
            await self.emit_event("ai_content_generated", item)
            return item
            
        except Exception as e:
            logger.error(f"Error generating AI content: {e}")
            raise
    
    def _get_default_content(self, item_type: ComponentType) -> Any:
        """Get default content for item type"""
        if item_type == ComponentType.NOTIZZETTEL:
            return ""
        elif item_type == ComponentType.TABELLE:
            return [["ID", "Name"], ["1", "Platzhalter"]]
        elif item_type == ComponentType.CODE:
            return "# Code hier eingeben"
        else:
            return None
    
    async def get_canvas_state(self, user_id: str) -> CanvasState:
        """Get canvas state for user"""
        return self.canvas_manager.get_canvas_state(user_id)
    
    async def update_canvas_state(self, user_id: str, state: CanvasState):
        """Update canvas state for user"""
        self.canvas_manager.update_canvas_state(user_id, state)
        await self.emit_event("canvas_updated", {"user_id": user_id, "state": state})

# =============================================================================
# USAGE EXAMPLE
# =============================================================================

async def main():
    """Example usage of the enhanced backend system"""
    
    # Initialize with SQLite database
    db_bridge = SqliteDatabaseBridge("test_desktop.db")
    
    # Initialize AI provider
    ai_provider = MockAIProvider()
    
    # Initialize desktop manager
    desktop = DesktopManager(db_bridge, ai_provider)
    
    # Add event handlers
    desktop.add_event_handler("item_created", lambda item: print(f"New item created: {item.title}"))
    desktop.add_event_handler("ai_content_generated", lambda item: print(f"AI content generated: {item.title}"))
    
    # Create some test items
    user_id = "test_user"
    
    # Create a note
    note = await desktop.create_item(
        user_id=user_id,
        item_type=ComponentType.NOTIZZETTEL,
        title="Test Note",
        position=Position(100, 100),
        content="This is a test note"
    )
    
    # Create a table
    table = await desktop.create_item(
        user_id=user_id,
        item_type=ComponentType.TABELLE,
        title="Test Table",
        position=Position(200, 200),
        content=[["Name", "Age"], ["Alice", "30"], ["Bob", "25"]]
    )
    
    # Generate AI content
    ai_item = await desktop.generate_ai_content(
        user_id=user_id,
        prompt="Create a Python class for vector operations",
        content_type="code",
        position=Position(300, 300)
    )
    
    # Load all items
    items = await desktop.load_user_items(user_id)
    print(f"Loaded {len(items)} items for user {user_id}")
    
    # Update canvas state
    canvas_state = CanvasState(
        position=Position(150, 150),
        scale=1.5,
        velocity=Position(0, 0),
        scale_velocity=0.0
    )
    await desktop.update_canvas_state(user_id, canvas_state)
    
    # Force save any pending items
    await desktop.save_manager.force_save()
    
    print("Backend system test completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())