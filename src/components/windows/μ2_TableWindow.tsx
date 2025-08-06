import React, { useState, useEffect, useCallback } from 'react';
import { UDItem } from '../../core/universalDocument';
import { UDFormat } from '../../core/UDFormat';

/**
 * μ2_TableWindow - WIND (☴) Views/UI - Interactive Data Table
 * 
 * Vollständige μX-Bagua Integration mit strukturierten Tabellen-Daten.
 * Enhanced Table Management mit UDItem Content Structure und Transformation History.
 * 
 * Features:
 * - UDItem-native Content Management (headers/rows structure)
 * - Advanced Table Operations (Add/Delete/Move Rows/Columns)
 * - Cell-level Editing mit Auto-Save
 * - Context Integration (📌 Button)
 * - Transformation History Tracking
 * - Data Type Recognition (Text/Number/Date)
 * - CSV Import/Export Support
 * - Bagua-Theme Integration
 */

interface μ2_TableWindowProps {
  /** Vollständiges UDItem mit allen Bagua-Metadaten */
  udItem: UDItem;
  /** Callback für UDItem Updates mit Transformation Tracking */
  onUDItemChange: (updatedItem: UDItem, transformationDescription: string) => void;
  /** Callback für Context Manager Integration (📌 Button) */
  onAddToContext?: (item: UDItem) => void;
  /** Read-only Modus */
  readOnly?: boolean;
}

interface μ2_TableData {
  headers: string[];
  rows: (string | number | Date)[][];
  metadata: {
    columnTypes: ('text' | 'number' | 'date')[];
    totalRows: number;
    totalColumns: number;
    lastModified: number;
  };
}

interface μ2_EditingCell {
  row: number;
  col: number;
}

export const μ2_TableWindow: React.FC<μ2_TableWindowProps> = ({
  udItem,
  onUDItemChange,
  onAddToContext,
  readOnly = false
}) => {

  // μ2_ Table State Management (WIND-Pattern: Views/UI Data)
  const [μ2_tableData, setμ2_TableData] = useState<μ2_TableData>({
    headers: ['Header 1', 'Header 2', 'Header 3'],
    rows: [['Row 1', 'Data 1', 'Data 2']],
    metadata: {
      columnTypes: ['text', 'text', 'text'],
      totalRows: 1,
      totalColumns: 3,
      lastModified: Date.now()
    }
  });

  const [μ2_editingCell, setμ2_EditingCell] = useState<μ2_EditingCell | null>(null);
  const [μ2_editValue, setμ2_EditValue] = useState('');
  const [μ2_selectedRow, setμ2_SelectedRow] = useState<number | null>(null);
  const [μ2_selectedColumn, setμ2_SelectedColumn] = useState<number | null>(null);
  const [μ2_isInContext, setμ2_IsInContext] = useState(udItem.is_contextual || false);
  const [μ2_hasUnsavedChanges, setμ2_HasUnsavedChanges] = useState(false);

  // μ2_ Initialize Table Data from UDItem
  useEffect(() => {
    let tableData: μ2_TableData;

    if (typeof udItem.content === 'object' && udItem.content.headers && udItem.content.rows) {
      // UDItem has structured table data
      tableData = {
        headers: udItem.content.headers || ['Header 1', 'Header 2', 'Header 3'],
        rows: udItem.content.rows || [['Row 1', 'Data 1', 'Data 2']],
        metadata: {
          columnTypes: udItem.content.columnTypes || ['text', 'text', 'text'],
          totalRows: udItem.content.rows?.length || 1,
          totalColumns: udItem.content.headers?.length || 3,
          lastModified: udItem.updated_at
        }
      };
    } else if (Array.isArray(udItem.content)) {
      // UDItem has raw array data (V1 compatibility)
      const [firstRow, ...dataRows] = udItem.content;
      tableData = {
        headers: firstRow || ['Header 1', 'Header 2', 'Header 3'],
        rows: dataRows.length > 0 ? dataRows : [['Row 1', 'Data 1', 'Data 2']],
        metadata: {
          columnTypes: new Array(firstRow?.length || 3).fill('text'),
          totalRows: dataRows.length || 1,
          totalColumns: firstRow?.length || 3,
          lastModified: udItem.updated_at
        }
      };
    } else {
      // Default table structure
      tableData = μ2_tableData;
    }

    setμ2_TableData(tableData);
    setμ2_IsInContext(udItem.is_contextual || false);
  }, [udItem]);

  // μ2_ Detect Column Types automatically
  const _μ2_detectColumnType = useCallback((columnIndex: number): 'text' | 'number' | 'date' => {
    const columnValues = μ2_tableData.rows.map(row => row[columnIndex]).filter(val => val != null && val !== '');
    
    if (columnValues.length === 0) return 'text';

    let numberCount = 0;
    let dateCount = 0;

    for (const value of columnValues) {
      const strValue = String(value);
      
      // Check if it's a number
      if (!isNaN(Number(strValue)) && strValue.trim() !== '') {
        numberCount++;
      }
      
      // Check if it's a date
      const dateValue = new Date(strValue);
      if (!isNaN(dateValue.getTime()) && strValue.includes('-') || strValue.includes('/')) {
        dateCount++;
      }
    }

    const total = columnValues.length;
    if (numberCount / total > 0.7) return 'number';
    if (dateCount / total > 0.7) return 'date';
    return 'text';
  }, [μ2_tableData.rows]);

  // μ2_ Save Table Data to UDItem
  const μ2_saveTableData = useCallback((newTableData: μ2_TableData, description: string) => {
    const updatedContent = {
      headers: newTableData.headers,
      rows: newTableData.rows,
      columnTypes: newTableData.metadata.columnTypes,
      totalRows: newTableData.metadata.totalRows,
      totalColumns: newTableData.metadata.totalColumns,
      tableType: 'structured', // Marker für structured table data
      
      // V1 Compatibility: Also save as flat array
      flatArray: [newTableData.headers, ...newTableData.rows]
    };

    onUDItemChange({
      ...udItem,
      content: updatedContent,
      updated_at: Date.now()
    }, description);

    setμ2_HasUnsavedChanges(false);
  }, [udItem, onUDItemChange]);

  // μ2_ Cell Click Handler
  const μ2_handleCellClick = useCallback((row: number, col: number) => {
    if (readOnly) return;
    
    setμ2_EditingCell({ row, col });
    const cellValue = row === -1 ? μ2_tableData.headers[col] : μ2_tableData.rows[row][col];
    setμ2_EditValue(String(cellValue || ''));
  }, [μ2_tableData, readOnly]);

  // μ2_ Cell Save Handler
  const μ2_handleCellSave = useCallback(() => {
    if (!μ2_editingCell) return;

    const { row, col } = μ2_editingCell;
    let newTableData = { ...μ2_tableData };

    if (row === -1) {
      // Editing header
      newTableData.headers[col] = μ2_editValue;
    } else {
      // Editing data cell
      let processedValue: string | number | Date = μ2_editValue;
      
      // Process value based on detected column type
      const columnType = μ2_tableData.metadata.columnTypes[col];
      if (columnType === 'number' && !isNaN(Number(μ2_editValue))) {
        processedValue = Number(μ2_editValue);
      } else if (columnType === 'date') {
        const dateValue = new Date(μ2_editValue);
        if (!isNaN(dateValue.getTime())) {
          processedValue = dateValue;
        }
      }
      
      newTableData.rows[row][col] = processedValue;
    }

    newTableData.metadata.lastModified = Date.now();
    setμ2_TableData(newTableData);
    setμ2_HasUnsavedChanges(true);
    
    // Auto-save with 2s debounce
    setTimeout(() => {
      μ2_saveTableData(newTableData, `Zelle ${row === -1 ? 'Header' : 'Row ' + (row + 1)}:${col + 1} bearbeitet`);
    }, 2000);

    setμ2_EditingCell(null);
    setμ2_EditValue('');
  }, [μ2_editingCell, μ2_editValue, μ2_tableData, μ2_saveTableData]);

  // μ2_ Add Row
  const μ2_addRow = useCallback(() => {
    if (readOnly) return;
    
    const newRow = new Array(μ2_tableData.headers.length).fill('');
    const newTableData = {
      ...μ2_tableData,
      rows: [...μ2_tableData.rows, newRow],
      metadata: {
        ...μ2_tableData.metadata,
        totalRows: μ2_tableData.rows.length + 1,
        lastModified: Date.now()
      }
    };
    
    setμ2_TableData(newTableData);
    μ2_saveTableData(newTableData, `Neue Zeile hinzugefügt (${newTableData.metadata.totalRows} Zeilen gesamt)`);
  }, [μ2_tableData, μ2_saveTableData, readOnly]);

  // μ2_ Delete Row
  const μ2_deleteRow = useCallback((rowIndex: number) => {
    if (readOnly || μ2_tableData.rows.length <= 1) return;
    
    const newTableData = {
      ...μ2_tableData,
      rows: μ2_tableData.rows.filter((_, index) => index !== rowIndex),
      metadata: {
        ...μ2_tableData.metadata,
        totalRows: μ2_tableData.rows.length - 1,
        lastModified: Date.now()
      }
    };
    
    setμ2_TableData(newTableData);
    setμ2_SelectedRow(null);
    μ2_saveTableData(newTableData, `Zeile ${rowIndex + 1} gelöscht`);
  }, [μ2_tableData, μ2_saveTableData, readOnly]);

  // μ2_ Add Column
  const μ2_addColumn = useCallback(() => {
    if (readOnly) return;
    
    const newHeaders = [...μ2_tableData.headers, `Header ${μ2_tableData.headers.length + 1}`];
    const newRows = μ2_tableData.rows.map(row => [...row, '']);
    const newColumnTypes = [...μ2_tableData.metadata.columnTypes, 'text' as const] as ('text' | 'number' | 'date')[];
    
    const newTableData = {
      headers: newHeaders,
      rows: newRows,
      metadata: {
        ...μ2_tableData.metadata,
        columnTypes: newColumnTypes,
        totalColumns: newHeaders.length,
        lastModified: Date.now()
      }
    };
    
    setμ2_TableData(newTableData);
    μ2_saveTableData(newTableData, `Neue Spalte hinzugefügt (${newTableData.metadata.totalColumns} Spalten gesamt)`);
  }, [μ2_tableData, μ2_saveTableData, readOnly]);

  // μ2_ Delete Column  
  const μ2_deleteColumn = useCallback((colIndex: number) => {
    if (readOnly || μ2_tableData.headers.length <= 1) return;
    
    const newHeaders = μ2_tableData.headers.filter((_, index) => index !== colIndex);
    const newRows = μ2_tableData.rows.map(row => row.filter((_, index) => index !== colIndex));
    const newColumnTypes = μ2_tableData.metadata.columnTypes.filter((_, index) => index !== colIndex) as ('text' | 'number' | 'date')[];
    
    const newTableData = {
      headers: newHeaders,
      rows: newRows,
      metadata: {
        ...μ2_tableData.metadata,
        columnTypes: newColumnTypes,
        totalColumns: newHeaders.length,
        lastModified: Date.now()
      }
    };
    
    setμ2_TableData(newTableData);
    setμ2_SelectedColumn(null);
    μ2_saveTableData(newTableData, `Spalte ${colIndex + 1} gelöscht`);
  }, [μ2_tableData, μ2_saveTableData, readOnly]);

  // μ2_ Context Toggle
  const μ2_toggleContext = useCallback(() => {
    if (!onAddToContext) return;

    const wasInContext = μ2_isInContext;
    setμ2_IsInContext(!wasInContext);
    
    onUDItemChange({
      ...udItem,
      is_contextual: !wasInContext
    }, !wasInContext 
      ? 'Tabelle zum AI-Context hinzugefügt' 
      : 'Tabelle aus AI-Context entfernt'
    );

    if (!wasInContext) {
      onAddToContext({
        ...udItem,
        is_contextual: true
      });
    }
  }, [μ2_isInContext, udItem, onUDItemChange, onAddToContext]);

  // μ2_ CSV Export
  const μ2_exportCSV = useCallback(() => {
    const csvContent = [
      μ2_tableData.headers.join(','),
      ...μ2_tableData.rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `table_${udItem.id}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [μ2_tableData, udItem.id]);

  // μ2_ Get Bagua Info
  const μ2_getBaguaInfo = useCallback((): string => {
    const descriptor = udItem.bagua_descriptor;
    const symbols: string[] = [];
    
    if (descriptor & UDFormat.BAGUA.HIMMEL) symbols.push('☰');
    if (descriptor & UDFormat.BAGUA.WIND) symbols.push('☴'); // Main für Table
    if (descriptor & UDFormat.BAGUA.WASSER) symbols.push('☵');
    if (descriptor & UDFormat.BAGUA.BERG) symbols.push('☶');
    if (descriptor & UDFormat.BAGUA.SEE) symbols.push('☱');
    if (descriptor & UDFormat.BAGUA.FEUER) symbols.push('☲');
    if (descriptor & UDFormat.BAGUA.DONNER) symbols.push('☳');
    if (descriptor & UDFormat.BAGUA.ERDE) symbols.push('☷');
    if (descriptor & UDFormat.BAGUA.TAIJI) symbols.push('☯');
    
    return symbols.join('') || '☴'; // WIND als Default für μ2
  }, [udItem.bagua_descriptor]);

  // μ2_ Key Handling
  const μ2_handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      μ2_handleCellSave();
    } else if (e.key === 'Escape') {
      setμ2_EditingCell(null);
      setμ2_EditValue('');
    }
  }, [μ2_handleCellSave]);

  // Raimunds algebraischer Transistor
  const μ2_showToolbar = UDFormat.transistor(!readOnly);
  const μ2_showContextButton = UDFormat.transistor(!!onAddToContext);

  // μ2_ Window Styling
  const μ2_windowStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minWidth: '300px',
    minHeight: '250px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    border: `2px solid ${μ2_isInContext ? '#ef4444' : '#e5e7eb'}`,
    borderRadius: '8px',
    boxShadow: μ2_isInContext 
      ? '0 4px 20px rgba(239, 68, 68, 0.15)' 
      : '0 4px 12px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    position: 'relative'
  };

  return (
    <div className={`μ2-table-window`} style={μ2_windowStyle}>
      
      {/* μ2_ Toolbar */}
      {μ2_showToolbar === 1 && (
        <div className="μ2-table-toolbar" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          gap: '8px'
        }}>
          
          {/* Left: Table Operations */}
          <div className="μ2-table-operations" style={{
            display: 'flex',
            gap: '6px'
          }}>
            <button onClick={μ2_addRow} title="Add Row" style={toolButtonStyle}>
              ➕ Row
            </button>
            <button onClick={μ2_addColumn} title="Add Column" style={toolButtonStyle}>
              ➕ Col
            </button>
            <button onClick={μ2_exportCSV} title="Export CSV" style={toolButtonStyle}>
              📊 CSV
            </button>
          </div>

          {/* Right: Meta Actions */}
          <div className="μ2-meta-actions" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            
            {/* Bagua Display */}
            <span 
              title={`Bagua: ${udItem.bagua_descriptor} - ${μ2_getBaguaInfo()}`}
              style={{
                fontSize: '16px',
                cursor: 'help'
              }}
            >
              {μ2_getBaguaInfo()}
            </span>

            {/* Context Button */}
            {μ2_showContextButton === 1 && (
              <button
                onClick={μ2_toggleContext}
                title={μ2_isInContext ? 'Aus AI-Context entfernen' : 'Zum AI-Context hinzufügen'}
                style={{
                  ...toolButtonStyle,
                  backgroundColor: μ2_isInContext ? '#ef4444' : '#6b7280',
                  color: 'white',
                  fontWeight: '600'
                }}
              >
                📌
              </button>
            )}
          </div>

        </div>
      )}

      {/* μ2_ Table Container */}
      <div className="μ2-table-container" style={{
        flex: 1,
        overflow: 'auto',
        position: 'relative'
      }}>
        <table className="μ2-interactive-table" style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}>
          
          {/* Table Header */}
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              {!readOnly && (
                <th style={{
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#f3f4f6',
                  width: '40px',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  #
                </th>
              )}
              {μ2_tableData.headers.map((header, colIndex) => (
                <th 
                  key={colIndex}
                  onClick={() => setμ2_SelectedColumn(colIndex)}
                  style={{
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: μ2_selectedColumn === colIndex ? '#ddd6fe' : '#f9fafb',
                    cursor: readOnly ? 'default' : 'pointer',
                    position: 'relative',
                    fontWeight: '600'
                  }}
                >
                  {μ2_editingCell?.row === -1 && μ2_editingCell?.col === colIndex ? (
                    <input
                      type="text"
                      value={μ2_editValue}
                      onChange={(e) => setμ2_EditValue(e.target.value)}
                      onBlur={μ2_handleCellSave}
                      onKeyDown={μ2_handleKeyDown}
                      autoFocus
                      style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                        fontWeight: '600'
                      }}
                    />
                  ) : (
                    <div 
                      onClick={() => μ2_handleCellClick(-1, colIndex)}
                      style={{ cursor: readOnly ? 'default' : 'text' }}
                    >
                      {header}
                    </div>
                  )}
                  
                  {/* Column Type Indicator */}
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    fontSize: '10px',
                    color: '#9ca3af'
                  }}>
                    {μ2_tableData.metadata.columnTypes[colIndex] === 'number' ? '123' :
                     μ2_tableData.metadata.columnTypes[colIndex] === 'date' ? '📅' : 'Aa'}
                  </div>

                  {/* Delete Column Button */}
                  {!readOnly && μ2_selectedColumn === colIndex && μ2_tableData.headers.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        μ2_deleteColumn(colIndex);
                      }}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        fontSize: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Delete Column"
                    >
                      ✕
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {μ2_tableData.rows.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                onClick={() => setμ2_SelectedRow(rowIndex)}
                style={{
                  backgroundColor: μ2_selectedRow === rowIndex ? '#fef3c7' : 'white',
                  cursor: readOnly ? 'default' : 'pointer'
                }}
              >
                {/* Row Controls */}
                {!readOnly && (
                  <td style={{
                    padding: '4px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#6b7280',
                    position: 'relative'
                  }}>
                    <div>{rowIndex + 1}</div>
                    
                    {/* Delete Row Button */}
                    {μ2_selectedRow === rowIndex && μ2_tableData.rows.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          μ2_deleteRow(rowIndex);
                        }}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          fontSize: '10px',
                          cursor: 'pointer'
                        }}
                        title="Delete Row"
                      >
                        ✕
                      </button>
                    )}
                  </td>
                )}
                
                {/* Data Cells */}
                {row.map((cell, colIndex) => (
                  <td 
                    key={colIndex}
                    onClick={() => μ2_handleCellClick(rowIndex, colIndex)}
                    style={{
                      padding: '8px',
                      border: '1px solid #e5e7eb',
                      cursor: readOnly ? 'default' : 'text',
                      backgroundColor: 
                        μ2_editingCell?.row === rowIndex && μ2_editingCell?.col === colIndex 
                          ? '#fef3c7' : 'transparent'
                    }}
                  >
                    {μ2_editingCell?.row === rowIndex && μ2_editingCell?.col === colIndex ? (
                      <input
                        type="text"
                        value={μ2_editValue}
                        onChange={(e) => setμ2_EditValue(e.target.value)}
                        onBlur={μ2_handleCellSave}
                        onKeyDown={μ2_handleKeyDown}
                        autoFocus
                        style={{
                          width: '100%',
                          border: 'none',
                          outline: 'none',
                          backgroundColor: 'transparent'
                        }}
                      />
                    ) : (
                      <span>
                        {cell instanceof Date ? cell.toLocaleDateString() : (cell || (readOnly ? '' : 'Click to edit'))}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Unsaved Changes Indicator */}
        {μ2_hasUnsavedChanges && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            padding: '4px 8px',
            backgroundColor: '#f59e0b',
            color: 'white',
            fontSize: '12px',
            borderRadius: '4px',
            fontWeight: '500'
          }}>
            Unsaved
          </div>
        )}
      </div>

      {/* μ2_ Status Bar */}
      <div className="μ2-table-status" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 12px',
        backgroundColor: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        
        {/* Left: Table Stats */}
        <div className="μ2-table-stats" style={{
          display: 'flex',
          gap: '12px'
        }}>
          <span>{μ2_tableData.metadata.totalRows} rows</span>
          <span>{μ2_tableData.metadata.totalColumns} columns</span>
          <span>{μ2_tableData.rows.reduce((acc, row) => acc + row.filter(cell => cell !== '').length, 0)} cells</span>
        </div>

        {/* Center: UDItem Info */}
        <div className="μ2-uditem-info" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px'
        }}>
          <span title="UDItem ID">{udItem.id.split('_').pop()}</span>
          <span title="Last Modified">{new Date(μ2_tableData.metadata.lastModified).toLocaleTimeString()}</span>
          {μ2_isInContext && (
            <span 
              title="In AI Context" 
              style={{ color: '#ef4444', fontWeight: '600' }}
            >
              📌 CONTEXT
            </span>
          )}
        </div>

        {/* Right: Mode */}
        <div className="μ2-mode-info">
          <span style={{
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: readOnly ? '#6b7280' : '#22c55e',
            color: 'white',
            fontWeight: '500',
            fontSize: '11px'
          }}>
            {readOnly ? 'READ-ONLY' : 'EDIT'}
          </span>
        </div>

      </div>

    </div>
  );
};

// μ2_ Tool Button Styling
const toolButtonStyle: React.CSSProperties = {
  padding: '4px 8px',
  fontSize: '12px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  backgroundColor: 'white',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

export default μ2_TableWindow;