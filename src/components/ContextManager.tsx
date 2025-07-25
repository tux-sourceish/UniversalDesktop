import React from 'react';
import '../styles/ContextManager.css';

export interface ContextItem {
  id: string;
  title: string;
  type: 'window' | 'file' | 'selection';
  tokens?: number;
  content?: string;
}

interface ContextManagerProps {
  items: ContextItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  maxTokens?: number;
}

export const ContextManager: React.FC<ContextManagerProps> = ({
  items,
  onRemoveItem,
  onClearAll,
  maxTokens = 100000
}) => {
  // Token-Schätzung: content.length / 4
  const estimateTokens = (content: string): number => {
    return Math.ceil(content.length / 4);
  };

  // Berechne Tokens für jedes Item
  const itemsWithTokens = items.map(item => ({
    ...item,
    tokens: item.content ? estimateTokens(item.content) : 0
  }));

  const totalTokens = itemsWithTokens.reduce((sum, item) => sum + item.tokens!, 0);
  const tokenPercentage = (totalTokens / maxTokens) * 100;

  const getTokenWarningClass = () => {
    if (tokenPercentage > 100) return 'token-error';
    if (tokenPercentage > 80) return 'token-warning';
    return 'token-ok';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'window': return '🪟';
      case 'file': return '📄';
      case 'selection': return '✂️';
      default: return '📋';
    }
  };

  const formatTokens = (tokens: number): string => {
    if (tokens > 1000) return `${(tokens / 1000).toFixed(1)}k`;
    return tokens.toString();
  };

  return (
    <div className="context-manager">
      <div className="context-header">
        <h4>📌 Kontext-Manager</h4>
        <div className={`token-display ${getTokenWarningClass()}`}>
          <span className="token-count">{formatTokens(totalTokens)}</span>
          <span className="token-max">/{formatTokens(maxTokens)}</span>
          <span className="token-percent">({tokenPercentage.toFixed(0)}%)</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="context-empty">
          <div className="empty-icon">🔍</div>
          <div className="empty-text">Keine Elemente im Kontext</div>
          <div className="empty-hint">Klicke auf 📌 bei einem Fenster um es hinzuzufügen</div>
        </div>
      ) : (
        <>
          <div className="context-items">
            {itemsWithTokens.map(item => (
              <div key={item.id} className="context-item">
                <div className="item-info">
                  <span className="item-icon">{getTypeIcon(item.type)}</span>
                  <span className="item-title">{item.title}</span>
                  <span className="item-tokens">{formatTokens(item.tokens!)}</span>
                </div>
                <button
                  className="item-remove"
                  onClick={() => onRemoveItem(item.id)}
                  title="Aus Kontext entfernen"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="context-actions">
            <button
              className="clear-all-btn"
              onClick={onClearAll}
              title="Alle Kontext-Elemente entfernen"
            >
              🗑️ Alle löschen
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ContextManager;