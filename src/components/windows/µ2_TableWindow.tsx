import React, { useState, useEffect, useCallback } from 'react';
import { UDItem } from '../../core/universalDocument';
import { UDFormat } from '../../core/UDFormat';

/**
 * µ2_TableWindow - WIND (☴) Views/UI - Interactive Data Table
 * 
 * Vollständige µX-Bagua Integration mit strukturierten Tabellen-Daten.
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

interface µ2_TableWindowProps {
  /** Vollständiges UDItem mit allen Bagua-Metadaten */
  udItem: UDItem;
  /** Callback für UDItem Updates mit Transformation Tracking */
  onUDItemChange: (updatedItem: UDItem, transformationDescription: string) => void;
  /** Callback für Context Manager Integration (📌 Button) */
  onAddToContext?: (item: UDItem) => void;
  /** Read-only Modus */
  readOnly?: boolean;
}

interface µ2_TableData {
  headers: string[];
  rows: (string | number | Date)[][];
  metadata: {
    columnTypes: ('text' | 'number' | 'date')[];
    totalRows: number;
    totalColumns: number;
    lastModified: number;
  };
}

interface µ2_EditingCell {
  row: number;
  col: number;
}

export const µ2_TableWindow: React.FC<µ2_TableWindowProps> = ({
  udItem,
  onUDItemChange,
  onAddToContext,
  readOnly = false
}) => {

  // µ2_ Table State Management (WIND-Pattern: Views/UI Data)
  const [µ2_tableData, setµ2_TableData] = useState<µ2_TableData>({
    headers: ['Header 1', 'Header 2', 'Header 3'],
    rows: [['Row 1', 'Data 1', 'Data 2']],
    metadata: {
      columnTypes: ['text', 'text', 'text'],
      totalRows: 1,
      totalColumns: 3,
      lastModified: Date.now()
    }
  });

  const [µ2_editingCell, setµ2_EditingCell] = useState<µ2_EditingCell | null>(null);
  const [µ2_editValue, setµ2_EditValue] = useState('');
  const [µ2_selectedRow, setµ2_SelectedRow] = useState<number | null>(null);
  const [µ2_selectedColumn, setµ2_SelectedColumn] = useState<number | null>(null);
  const [µ2_isInContext, setµ2_IsInContext] = useState(udItem.is_contextual || false);
  const [µ2_hasUnsavedChanges, setµ2_HasUnsavedChanges] = useState(false);

  // µ2_ Initialize Table Data from UDItem
  useEffect(() => {
    let tableData: µ2_TableData;

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
      tableData = µ2_tableData;
    }

    setµ2_TableData(tableData);
    setµ2_IsInContext(udItem.is_contextual || false);
  }, [udItem]);

  // µ2_ Detect Column Types automatically
  const _µ2_detectColumnType = useCallback((columnIndex: number): 'text' | 'number' | 'date' => {
    const columnValues = µ2_tableData.rows.map(row => row[columnIndex]).filter(val => val != null && val !== '');
    
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
  }, [µ2_tableData.rows]);

  // µ2_ Save Table Data to UDItem
  const µ2_saveTableData = useCallback((newTableData: µ2_TableData, description: string) => {
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

    setµ2_HasUnsavedChanges(false);
  }, [udItem, onUDItemChange]);

  // µ2_ Cell Click Handler
  const µ2_handleCellClick = useCallback((row: number, col: number) => {
    if (readOnly) return;
    
    setµ2_EditingCell({ row, col });
    const cellValue = row === -1 ? µ2_tableData.headers[col] : µ2_tableData.rows[row][col];
    setµ2_EditValue(String(cellValue || ''));
  }, [µ2_tableData, readOnly]);

  // µ2_ Cell Save Handler
  const µ2_handleCellSave = useCallback(() => {
    if (!µ2_editingCell) return;

    const { row, col } = µ2_editingCell;
    let newTableData = { ...µ2_tableData };

    if (row === -1) {
      // Editing header
      newTableData.headers[col] = µ2_editValue;
    } else {
      // Editing data cell
      let processedValue: string | number | Date = µ2_editValue;
      
      // Process value based on detected column type
      const columnType = µ2_tableData.metadata.columnTypes[col];
      if (columnType === 'number' && !isNaN(Number(µ2_editValue))) {
        processedValue = Number(µ2_editValue);
      } else if (columnType === 'date') {
        const dateValue = new Date(µ2_editValue);
        if (!isNaN(dateValue.getTime())) {
          processedValue = dateValue;
        }
      }
      
      newTableData.rows[row][col] = processedValue;
    }

    newTableData.metadata.lastModified = Date.now();
    setµ2_TableData(newTableData);
    setµ2_HasUnsavedChanges(true);
    
    // Auto-save with 2s debounce
    setTimeout(() => {
      µ2_saveTableData(newTableData, `Zelle ${row === -1 ? 'Header' : 'Row ' + (row + 1)}:${col + 1} bearbeitet`);
    }, 2000);

    setµ2_EditingCell(null);
    setµ2_EditValue('');
  }, [µ2_editingCell, µ2_editValue, µ2_tableData, µ2_saveTableData]);

  // µ2_ Add Row
  const µ2_addRow = useCallback(() => {
    if (readOnly) return;
    
    const newRow = new Array(µ2_tableData.headers.length).fill('');
    const newTableData = {
      ...µ2_tableData,
      rows: [...µ2_tableData.rows, newRow],
      metadata: {
        ...µ2_tableData.metadata,
        totalRows: µ2_tableData.rows.length + 1,
        lastModified: Date.now()
      }
    };
    
    setµ2_TableData(newTableData);
    µ2_saveTableData(newTableData, `Neue Zeile hinzugefügt (${newTableData.metadata.totalRows} Zeilen gesamt)`);
  }, [µ2_tableData, µ2_saveTableData, readOnly]);

  // µ2_ Delete Row
  const µ2_deleteRow = useCallback((rowIndex: number) => {
    if (readOnly || µ2_tableData.rows.length <= 1) return;
    
    const newTableData = {
      ...µ2_tableData,
      rows: µ2_tableData.rows.filter((_, index) => index !== rowIndex),
      metadata: {
        ...µ2_tableData.metadata,
        totalRows: µ2_tableData.rows.length - 1,
        lastModified: Date.now()
      }
    };
    
    setµ2_TableData(newTableData);
    setµ2_SelectedRow(null);
    µ2_saveTableData(newTableData, `Zeile ${rowIndex + 1} gelöscht`);
  }, [µ2_tableData, µ2_saveTableData, readOnly]);

  // µ2_ Add Column
  const µ2_addColumn = useCallback(() => {
    if (readOnly) return;
    
    const newHeaders = [...µ2_tableData.headers, `Header ${µ2_tableData.headers.length + 1}`];
    const newRows = µ2_tableData.rows.map(row => [...row, '']);
    const newColumnTypes = [...µ2_tableData.metadata.columnTypes, 'text' as const] as ('text' | 'number' | 'date')[];
    
    const newTableData = {
      headers: newHeaders,
      rows: newRows,
      metadata: {
        ...µ2_tableData.metadata,
        columnTypes: newColumnTypes,
        totalColumns: newHeaders.length,
        lastModified: Date.now()
      }
    };
    
    setµ2_TableData(newTableData);
    µ2_saveTableData(newTableData, `Neue Spalte hinzugefügt (${newTableData.metadata.totalColumns} Spalten gesamt)`);
  }, [µ2_tableData, µ2_saveTableData, readOnly]);

  // µ2_ Delete Column  
  const µ2_deleteColumn = useCallback((colIndex: number) => {
    if (readOnly || µ2_tableData.headers.length <= 1) return;
    
    const newHeaders = µ2_tableData.headers.filter((_, index) => index !== colIndex);
    const newRows = µ2_tableData.rows.map(row => row.filter((_, index) => index !== colIndex));
    const newColumnTypes = µ2_tableData.metadata.columnTypes.filter((_, index) => index !== colIndex) as ('text' | 'number' | 'date')[];
    
    const newTableData = {
      headers: newHeaders,
      rows: newRows,
      metadata: {
        ...µ2_tableData.metadata,
        columnTypes: newColumnTypes,
        totalColumns: newHeaders.length,
        lastModified: Date.now()
      }
    };
    
    setµ2_TableData(newTableData);
    setµ2_SelectedColumn(null);
    µ2_saveTableData(newTableData, `Spalte ${colIndex + 1} gelöscht`);
  }, [µ2_tableData, µ2_saveTableData, readOnly]);

  // µ2_ Context Toggle
  const µ2_toggleContext = useCallback(() => {
    if (!onAddToContext) return;

    const wasInContext = µ2_isInContext;
    setµ2_IsInContext(!wasInContext);
    
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
  }, [µ2_isInContext, udItem, onUDItemChange, onAddToContext]);

  // µ2_ CSV Export
  const µ2_exportCSV = useCallback(() => {
    const csvContent = [
      µ2_tableData.headers.join(','),
      ...µ2_tableData.rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `table_${udItem.id}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [µ2_tableData, udItem.id]);

  // µ2_ Get Bagua Info
  const µ2_getBaguaInfo = useCallback((): string => {
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
    
    return symbols.join('') || '☴'; // WIND als Default für µ2
  }, [udItem.bagua_descriptor]);

  // µ2_ Key Handling
  const µ2_handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      µ2_handleCellSave();
    } else if (e.key === 'Escape') {
      setµ2_EditingCell(null);
      setµ2_EditValue('');
    }
  }, [µ2_handleCellSave]);

  // Raimunds algebraischer Transistor
  const µ2_showToolbar = UDFormat.transistor(!readOnly);
  const µ2_showContextButton = UDFormat.transistor(!!onAddToContext);

  // µ2_ Window Styling
  const µ2_windowStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minWidth: '300px',
    minHeight: '250px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    border: `2px solid ${µ2_isInContext ? '#ef4444' : '#e5e7eb'}`,
    borderRadius: '8px',
    boxShadow: µ2_isInContext 
      ? '0 4px 20px rgba(239, 68, 68, 0.15)' 
      : '0 4px 12px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    position: 'relative'
  };

  return (
    <div className={`µ2-table-window`} style={µ2_windowStyle}>
      
      {/* µ2_ Toolbar */}
      {µ2_showToolbar === 1 && (
        <div className="µ2-table-toolbar" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          gap: '8px'
        }}>
          
          {/* Left: Table Operations */}
          <div className="µ2-table-operations" style={{
            display: 'flex',
            gap: '6px'
          }}>
            <button onClick={µ2_addRow} title="Add Row" style={toolButtonStyle}>
              ➕ Row
            </button>
            <button onClick={µ2_addColumn} title="Add Column" style={toolButtonStyle}>
              ➕ Col
            </button>
            <button onClick={µ2_exportCSV} title="Export CSV" style={toolButtonStyle}>
              📊 CSV
            </button>
          </div>

          {/* Right: Meta Actions */}
          <div className="µ2-meta-actions" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            
            {/* Bagua Display */}
            <span 
              title={`Bagua: ${udItem.bagua_descriptor} - ${µ2_getBaguaInfo()}`}
              style={{
                fontSize: '16px',
                cursor: 'help'
              }}
            >
              {µ2_getBaguaInfo()}
            </span>

            {/* Context Button */}
            {µ2_showContextButton === 1 && (
              <button
                onClick={µ2_toggleContext}
                title={µ2_isInContext ? 'Aus AI-Context entfernen' : 'Zum AI-Context hinzufügen'}
                style={{
                  ...toolButtonStyle,
                  backgroundColor: µ2_isInContext ? '#ef4444' : '#6b7280',
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

      {/* µ2_ Table Container */}
      <div className="µ2-table-container" style={{
        flex: 1,
        overflow: 'auto',
        position: 'relative'
      }}>
        <table className="µ2-interactive-table" style={{
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
              {µ2_tableData.headers.map((header, colIndex) => (
                <th 
                  key={colIndex}
                  onClick={() => setµ2_SelectedColumn(colIndex)}
                  style={{
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: µ2_selectedColumn === colIndex ? '#ddd6fe' : '#f9fafb',
                    cursor: readOnly ? 'default' : 'pointer',
                    position: 'relative',
                    fontWeight: '600'
                  }}
                >
                  {µ2_editingCell?.row === -1 && µ2_editingCell?.col === colIndex ? (
                    <input
                      type="text"
                      value={µ2_editValue}
                      onChange={(e) => setµ2_EditValue(e.target.value)}
                      onBlur={µ2_handleCellSave}
                      onKeyDown={µ2_handleKeyDown}
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
                      onClick={() => µ2_handleCellClick(-1, colIndex)}
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
                    {µ2_tableData.metadata.columnTypes[colIndex] === 'number' ? '123' :
                     µ2_tableData.metadata.columnTypes[colIndex] === 'date' ? '📅' : 'Aa'}
                  </div>

                  {/* Delete Column Button */}
                  {!readOnly && µ2_selectedColumn === colIndex && µ2_tableData.headers.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        µ2_deleteColumn(colIndex);
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
            {µ2_tableData.rows.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                onClick={() => setµ2_SelectedRow(rowIndex)}
                style={{
                  backgroundColor: µ2_selectedRow === rowIndex ? '#fef3c7' : 'white',
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
                    {µ2_selectedRow === rowIndex && µ2_tableData.rows.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          µ2_deleteRow(rowIndex);
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
                    onClick={() => µ2_handleCellClick(rowIndex, colIndex)}
                    style={{
                      padding: '8px',
                      border: '1px solid #e5e7eb',
                      cursor: readOnly ? 'default' : 'text',
                      backgroundColor: 
                        µ2_editingCell?.row === rowIndex && µ2_editingCell?.col === colIndex 
                          ? '#fef3c7' : 'transparent'
                    }}
                  >
                    {µ2_editingCell?.row === rowIndex && µ2_editingCell?.col === colIndex ? (
                      <input
                        type="text"
                        value={µ2_editValue}
                        onChange={(e) => setµ2_EditValue(e.target.value)}
                        onBlur={µ2_handleCellSave}
                        onKeyDown={µ2_handleKeyDown}
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
        {µ2_hasUnsavedChanges && (
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

      {/* µ2_ Status Bar */}
      <div className="µ2-table-status" style={{
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
        <div className="µ2-table-stats" style={{
          display: 'flex',
          gap: '12px'
        }}>
          <span>{µ2_tableData.metadata.totalRows} rows</span>
          <span>{µ2_tableData.metadata.totalColumns} columns</span>
          <span>{µ2_tableData.rows.reduce((acc, row) => acc + row.filter(cell => cell !== '').length, 0)} cells</span>
        </div>

        {/* Center: UDItem Info */}
        <div className="µ2-uditem-info" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px'
        }}>
          <span title="UDItem ID">{udItem.id.split('_').pop()}</span>
          <span title="Last Modified">{new Date(µ2_tableData.metadata.lastModified).toLocaleTimeString()}</span>
          {µ2_isInContext && (
            <span 
              title="In AI Context" 
              style={{ color: '#ef4444', fontWeight: '600' }}
            >
              📌 CONTEXT
            </span>
          )}
        </div>

        {/* Right: Mode */}
        <div className="µ2-mode-info">
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

// µ2_ Tool Button Styling
const toolButtonStyle: React.CSSProperties = {
  padding: '4px 8px',
  fontSize: '12px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  backgroundColor: 'white',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

export default µ2_TableWindow;