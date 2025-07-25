import React, { useState, useEffect } from 'react';
import '../styles/TableWindow.css';

interface TableWindowProps {
  content: any[][];
  onContentChange: (content: any[][]) => void;
  readOnly?: boolean;
}

const TableWindow: React.FC<TableWindowProps> = ({
  content,
  onContentChange,
  readOnly = false
}) => {
  const [tableData, setTableData] = useState<any[][]>(content || [['Header 1', 'Header 2', 'Header 3'], ['Row 1', 'Data 1', 'Data 2']]);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  useEffect(() => {
    if (content && Array.isArray(content)) {
      setTableData(content);
    }
  }, [content]);

  const handleCellClick = (row: number, col: number) => {
    if (readOnly) return;
    
    setEditingCell({ row, col });
    setEditValue(String(tableData[row][col] || ''));
  };

  const handleCellChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleCellSave = () => {
    if (editingCell) {
      const newData = [...tableData];
      newData[editingCell.row][editingCell.col] = editValue;
      setTableData(newData);
      onContentChange(newData);
    }
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellSave();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  const addRow = () => {
    if (readOnly) return;
    
    const newRow = new Array(tableData[0]?.length || 3).fill('');
    const newData = [...tableData, newRow];
    setTableData(newData);
    onContentChange(newData);
  };

  const deleteRow = (rowIndex: number) => {
    if (readOnly || tableData.length <= 1) return;
    
    const newData = tableData.filter((_, index) => index !== rowIndex);
    setTableData(newData);
    onContentChange(newData);
    setSelectedRow(null);
  };

  const addColumn = () => {
    if (readOnly) return;
    
    const newData = tableData.map(row => [...row, '']);
    setTableData(newData);
    onContentChange(newData);
  };

  const deleteColumn = (colIndex: number) => {
    if (readOnly || tableData[0]?.length <= 1) return;
    
    const newData = tableData.map(row => row.filter((_, index) => index !== colIndex));
    setTableData(newData);
    onContentChange(newData);
  };

  const moveRowUp = (rowIndex: number) => {
    if (readOnly || rowIndex === 0) return;
    
    const newData = [...tableData];
    [newData[rowIndex], newData[rowIndex - 1]] = [newData[rowIndex - 1], newData[rowIndex]];
    setTableData(newData);
    onContentChange(newData);
    setSelectedRow(rowIndex - 1);
  };

  const moveRowDown = (rowIndex: number) => {
    if (readOnly || rowIndex === tableData.length - 1) return;
    
    const newData = [...tableData];
    [newData[rowIndex], newData[rowIndex + 1]] = [newData[rowIndex + 1], newData[rowIndex]];
    setTableData(newData);
    onContentChange(newData);
    setSelectedRow(rowIndex + 1);
  };

  const clearTable = () => {
    if (readOnly) return;
    
    if (confirm('Are you sure you want to clear all table data?')) {
      const newData = [['Header 1', 'Header 2', 'Header 3']];
      setTableData(newData);
      onContentChange(newData);
    }
  };

  return (
    <div className="table-window">
      {!readOnly && (
        <div className="table-toolbar">
          <div className="table-toolbar-group">
            <button className="table-btn" onClick={addRow} title="Add Row">
              ➕ Row
            </button>
            <button className="table-btn" onClick={addColumn} title="Add Column">
              ➕ Col
            </button>
          </div>
          
          <div className="table-toolbar-group">
            <button 
              className="table-btn danger" 
              onClick={clearTable} 
              title="Clear Table"
            >
              🗑️ Clear
            </button>
          </div>
        </div>
      )}
      
      <div className="table-container">
        <table className="interactive-table">
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                className={`table-row ${selectedRow === rowIndex ? 'selected' : ''} ${rowIndex === 0 ? 'header-row' : ''}`}
                onClick={() => setSelectedRow(rowIndex)}
              >
                {!readOnly && (
                  <td className="table-controls">
                    <div className="row-controls">
                      <span className="row-number">{rowIndex + 1}</span>
                      <div className="row-actions">
                        <button 
                          className="row-btn" 
                          onClick={(e) => {
                            e.stopPropagation();
                            moveRowUp(rowIndex);
                          }}
                          disabled={rowIndex === 0}
                          title="Move Up"
                        >
                          ↑
                        </button>
                        <button 
                          className="row-btn" 
                          onClick={(e) => {
                            e.stopPropagation();
                            moveRowDown(rowIndex);
                          }}
                          disabled={rowIndex === tableData.length - 1}
                          title="Move Down"
                        >
                          ↓
                        </button>
                        <button 
                          className="row-btn danger" 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRow(rowIndex);
                          }}
                          disabled={tableData.length <= 1}
                          title="Delete Row"
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  </td>
                )}
                
                {row.map((cell, colIndex) => (
                  <td 
                    key={colIndex}
                    className={`table-cell ${editingCell?.row === rowIndex && editingCell?.col === colIndex ? 'editing' : ''}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={handleCellChange}
                        onBlur={handleCellSave}
                        onKeyDown={handleKeyDown}
                        className="cell-input"
                        autoFocus
                      />
                    ) : (
                      <span className="cell-content">
                        {cell || (readOnly ? '' : 'Click to edit')}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {!readOnly && tableData[0] && (
        <div className="column-controls">
          {tableData[0].map((_, colIndex) => (
            <button
              key={colIndex}
              className="col-btn danger"
              onClick={() => deleteColumn(colIndex)}
              disabled={tableData[0].length <= 1}
              title={`Delete Column ${colIndex + 1}`}
            >
              ❌
            </button>
          ))}
        </div>
      )}
      
      <div className="table-status">
        <span className="table-info">
          {tableData.length} rows × {tableData[0]?.length || 0} columns
        </span>
        <span className="table-mode">
          {readOnly ? 'READ-ONLY' : 'EDIT'}
        </span>
      </div>
    </div>
  );
};

export default TableWindow;