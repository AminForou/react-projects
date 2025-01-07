import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FaInfoCircle, FaEdit, FaEye, FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaSave, FaUpload, FaChevronDown, FaChevronRight, FaTrashAlt, FaFolder, FaFolderOpen, FaLock, FaLockOpen, FaCopy } from 'react-icons/fa';
import { SiGooglesheets } from 'react-icons/si';
import sitemapData from './sitemapData.json'; // Import the JSON file

const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const RegexIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3h2v14H3V3zm12 0h2v14h-2V3z" fill="currentColor"/>
    <path d="M7 7h2v2H7V7zm4 4h2v2h-2v-2z" fill="currentColor"/>
    <path d="M7 14.5l6-9" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const SitemapItem = ({ item, onAdd, onDelete, onEdit, onMove, onDuplicate, isEditMode, depth, maxDepth, onToggle }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(item.name);
  const [editedNote, setEditedNote] = useState(item.note);
  const [isOpen, setIsOpen] = useState(true);
  const [editedSpreadsheetLink, setEditedSpreadsheetLink] = useState(item.spreadsheetLink || '');
  const [editedProjectLink, setEditedProjectLink] = useState(item.projectLink || '');
  const [editedUrlCount, setEditedUrlCount] = useState(item.urlCount || 0);
  const [showActions, setShowActions] = useState(false);
  const [editedRegexConditions, setEditedRegexConditions] = useState(item.regexConditions || '');

  const handleEdit = () => {
    onEdit(item.id, editedName, editedNote, editedSpreadsheetLink, editedProjectLink, editedUrlCount, editedRegexConditions);
    setIsEditing(false);
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    onToggle && onToggle(item.id);
  };

  const showChildren = isEditMode || (isOpen && (maxDepth === 0 || depth < maxDepth));

  return (
    <div className={`ml-4 mt-2 border-l-2 ${isEditMode ? 'border-gray-200' : 'border-gray-300'} pl-4`}>
      <div 
        className={`flex items-center ${!isEditMode && 'py-2'} ${isEditMode ? 'hover:bg-gray-100 rounded transition-colors duration-200' : ''}`}
        onMouseEnter={() => isEditMode && setShowActions(true)}
        onMouseLeave={() => isEditMode && setShowActions(false)}
      >
        {!isEditMode && item.children && item.children.length > 0 && (
          <button onClick={toggleOpen} className="mr-2 text-gray-500 hover:text-gray-700">
            {isOpen ? <FaChevronDown /> : <FaChevronRight />}
          </button>
        )}
        {!isEditMode && (
          <span className="mr-2 text-gray-500">
            {item.children && item.children.length > 0 ? (
              isOpen ? <FaFolderOpen /> : <FaFolder />
            ) : null}
          </span>
        )}
        {isEditMode && isEditing ? (
          <div className="flex flex-col space-y-2 w-full">
            <input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="border rounded px-2 py-1 w-full"
              autoFocus
            />
            <input
              value={editedNote}
              onChange={(e) => setEditedNote(e.target.value)}
              placeholder="Add note"
              className="border rounded px-2 py-1 w-full"
            />
            <input
              value={editedSpreadsheetLink}
              onChange={(e) => setEditedSpreadsheetLink(e.target.value)}
              placeholder="Spreadsheet link"
              className="border rounded px-2 py-1 w-full"
            />
            <input
              value={editedProjectLink}
              onChange={(e) => setEditedProjectLink(e.target.value)}
              placeholder="Project link"
              className="border rounded px-2 py-1 w-full"
            />
            <input
              type="number"
              value={editedUrlCount}
              onChange={(e) => setEditedUrlCount(parseInt(e.target.value) || 0)}
              placeholder="URL count"
              className="border rounded px-2 py-1 w-20"
            />
            <textarea
              value={editedRegexConditions}
              onChange={(e) => setEditedRegexConditions(e.target.value)}
              placeholder="Enter regex conditions"
              className="border rounded px-2 py-1 w-full h-24"
            />
            <div className="flex space-x-2">
              <button onClick={handleEdit} className="bg-blue-500 text-white px-2 py-1 rounded text-sm">Save</button>
              <button onClick={() => setIsEditing(false)} className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center flex-grow">
              <span 
                className={`cursor-pointer mr-2 ${isEditMode ? 'text-lg font-medium text-gray-700' : 'text-base font-semibold text-gray-800'}`}
                onClick={() => isEditMode && setIsEditing(true)}
              >
                {item.name}
              </span>
              {!isEditMode && item.regexConditions && (
                <div className="relative group">
                  <RegexIcon className="text-blue-500 cursor-help" />
                  <div className="absolute hidden group-hover:block bg-white border border-gray-200 rounded p-2 z-10 w-64 shadow-lg">
                    <pre className="text-xs whitespace-pre-wrap">{item.regexConditions}</pre>
                  </div>
                </div>
              )}
              {!isEditMode && (
                <div className="flex items-center space-x-2 ml-2">
                  {item.spreadsheetLink && (
                    <a href={item.spreadsheetLink} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-600 transition-colors" title="Open Google Sheet">
                      <SiGooglesheets />
                    </a>
                  )}
                  {item.projectLink && (
                    <a href={item.projectLink} target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:text-purple-600 transition-colors font-bold" title="Open Project">
                      b
                    </a>
                  )}
                  {item.urlCount > 0 && (
                    <span className="text-gray-500 text-sm font-medium" title="URL Count">
                      ({formatNumber(item.urlCount)} URLs)
                    </span>
                  )}
                  {item.note && (
                    <span className={`text-blue-500 cursor-help relative group ${depth > 1 ? 'text-opacity-70' : ''}`}>
                      <FaInfoCircle className={depth > 1 ? 'text-sm' : ''} />
                      <span className="absolute hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 -mt-16 -ml-2 w-48 z-10 shadow-lg">
                        {item.note}
                      </span>
                    </span>
                  )}
                </div>
              )}
            </div>
            {isEditMode && showActions && (
              <div className="flex space-x-2 items-center">
                <button onClick={() => onAdd(item.id)} className="text-green-500 hover:text-green-600" title="Add Child">
                  <FaPlus />
                </button>
                <button onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-600" title="Delete">
                  <FaTrash />
                </button>
                <button onClick={() => onMove(item.id, 'up')} className="text-gray-500 hover:text-gray-600" title="Move Up">
                  <FaArrowUp />
                </button>
                <button onClick={() => onMove(item.id, 'down')} className="text-gray-500 hover:text-gray-600" title="Move Down">
                  <FaArrowDown />
                </button>
                <button onClick={() => onDuplicate(item.id)} className="text-blue-500 hover:text-blue-600" title="Duplicate">
                  <FaCopy />
                </button>
                <button onClick={() => setIsEditing(true)} className="text-blue-500 hover:text-blue-600" title="Edit">
                  <FaEdit />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {showChildren && item.children && (
        <div className={`ml-4 ${!isEditMode && 'mt-2'}`}>
          {item.children.map((child) => (
            <SitemapItem
              key={child.id}
              item={child}
              onAdd={onAdd}
              onDelete={onDelete}
              onEdit={onEdit}
              onMove={onMove}
              onDuplicate={onDuplicate}
              isEditMode={isEditMode}
              depth={depth + 1}
              maxDepth={maxDepth}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SitemapCreator = () => {
  const [sitemap, setSitemap] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [maxDepth, setMaxDepth] = useState(0);
  const [openItems, setOpenItems] = useState({});
  const [isLocked, setIsLocked] = useState(true);
  const [title, setTitle] = useState("Sitemap Creator");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  useEffect(() => {
    // Set the imported JSON data to the state
    setSitemap(sitemapData);
  }, []);

  const addItem = (parentId = null) => {
    const newItem = {
      id: uuidv4(),
      name: 'New Item',
      children: [],
      note: '',
      spreadsheetLink: '',
      projectLink: '',
      urlCount: 0,
      regexConditions: '',
    };

    if (parentId === null) {
      setSitemap([...sitemap, newItem]);
    } else {
      const updateChildren = (items) =>
        items.map((item) => {
          if (item.id === parentId) {
            return { ...item, children: [...item.children, newItem] };
          }
          if (item.children) {
            return { ...item, children: updateChildren(item.children) };
          }
          return item;
        });

      setSitemap(updateChildren(sitemap));
    }
  };

  const deleteItem = (id) => {
    const removeItem = (items) =>
      items.filter((item) => {
        if (item.id === id) return false;
        if (item.children) {
          item.children = removeItem(item.children);
        }
        return true;
      });

    setSitemap(removeItem(sitemap));
  };

  const editItem = (id, newName, newNote, newSpreadsheetLink, newProjectLink, newUrlCount, newRegexConditions) => {
    const updateItem = (items) =>
      items.map((item) => {
        if (item.id === id) {
          return { 
            ...item, 
            name: newName, 
            note: newNote, 
            spreadsheetLink: newSpreadsheetLink, 
            projectLink: newProjectLink,
            urlCount: newUrlCount,
            regexConditions: newRegexConditions
          };
        }
        if (item.children) {
          return { ...item, children: updateItem(item.children) };
        }
        return item;
      });

    setSitemap(updateItem(sitemap));
  };

  const moveItem = (id, direction) => {
    const moveItemInArray = (items) => {
      const index = items.findIndex(item => item.id === id);
      if (index === -1) return items;

      const newItems = [...items];
      if (direction === 'up' && index > 0) {
        [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      } else if (direction === 'down' && index < items.length - 1) {
        [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      }
      return newItems;
    };

    const moveItemInTree = (items) => {
      const newItems = moveItemInArray(items);
      if (newItems !== items) return newItems;

      return newItems.map(item => {
        if (item.children) {
          return { ...item, children: moveItemInTree(item.children) };
        }
        return item;
      });
    };

    setSitemap(moveItemInTree(sitemap));
  };

  const duplicateItem = (itemId) => {
    const duplicateWithNewIds = (item) => {
      const newItem = {
        ...item,
        id: uuidv4(),
        children: item.children ? item.children.map(duplicateWithNewIds) : []
      };
      return newItem;
    };

    const findAndDuplicate = (items) => {
      return items.reduce((acc, item) => {
        acc.push(item);
        if (item.id === itemId) {
          const duplicatedItem = duplicateWithNewIds(item);
          duplicatedItem.name = `${duplicatedItem.name} (Copy)`;
          acc.push(duplicatedItem);
        } else if (item.children) {
          item.children = findAndDuplicate(item.children);
        }
        return acc;
      }, []);
    };

    setSitemap(findAndDuplicate(sitemap));
  };

  const handleSave = () => {
    localStorage.setItem('sitemapData', JSON.stringify(sitemap));

    const blob = new Blob([JSON.stringify(sitemap, null, 2)], { type: 'application/json' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap_data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert('Sitemap data saved successfully!');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const uploadedData = JSON.parse(e.target.result);
          setSitemap(uploadedData);
          localStorage.setItem('sitemapData', JSON.stringify(uploadedData));
          alert('Sitemap data loaded successfully!');
        } catch (error) {
          alert('Error loading file: Invalid JSON format');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDepthChange = (e) => {
    setMaxDepth(parseInt(e.target.value));
  };

  const handleToggle = (itemId) => {
    setOpenItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all sitemap data? This action cannot be undone.')) {
      setSitemap([]);
      localStorage.removeItem('sitemapData');
      alert('All sitemap data has been cleared.');
    }
  };

  const handleLockClick = (e) => {
    e.preventDefault();
    if (e.button === 1) { // Middle mouse button
      setIsLocked(!isLocked);
    } else if (e.button === 0 && !isLocked) { // Left mouse button and unlocked
      setIsEditMode(!isEditMode);
    }
  };

  const handleTitleClick = () => {
    if (isEditMode) {
      setIsEditingTitle(true);
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
  };

  const totalUrlCount = useMemo(() => {
    const countUrls = (items) => {
      return items.reduce((total, item) => {
        const childCount = item.children ? countUrls(item.children) : 0;
        return total + (item.urlCount || 0) + childCount;
      }, 0);
    };
    return countUrls(sitemap);
  }, [sitemap]);

  return (
    <div className="p-4 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        {isEditMode && isEditingTitle ? (
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            className="text-3xl font-bold text-gray-800 bg-transparent border-b-2 border-blue-500 focus:outline-none"
            autoFocus
          />
        ) : (
          <h1 
            className={`text-3xl font-bold text-gray-800 ${isEditMode ? 'cursor-pointer hover:text-blue-600' : ''}`}
            onClick={handleTitleClick}
          >
            {title}
          </h1>
        )}
        <div className="space-x-2 flex items-center">
          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors"
          >
            <FaSave className="inline mr-2" /> Save
          </button>
          <label className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors cursor-pointer">
            <FaUpload className="inline mr-2" /> Load
            <input type="file" onChange={handleFileUpload} className="hidden" accept=".json" />
          </label>
          {isEditMode && (
            <button
              onClick={handleClearAll}
              className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors"
            >
              <FaTrashAlt className="inline mr-2" /> Clear All
            </button>
          )}
          <button
            onMouseDown={handleLockClick}
            className={`px-4 py-2 rounded-full ${
              isEditMode ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            } hover:bg-opacity-80 transition-colors relative`}
            title={isLocked ? "Middle-click to unlock" : (isEditMode ? "Middle-click to lock" : "Left-click to enter edit mode")}
          >
            {isLocked ? <FaLock className="inline" /> : (isEditMode ? <FaEye className="inline" /> : <FaLockOpen className="inline" />)}
            {!isEditMode && !isLocked && (
              <FaEdit className="inline absolute -right-2 -top-2 text-green-500 animate-bounce" />
            )}
          </button>
          {!isEditMode && (
            <select
              value={maxDepth}
              onChange={handleDepthChange}
              className="bg-white border border-gray-300 rounded-md px-2 py-1"
            >
              <option value="0">All Levels</option>
              <option value="1">1 Level</option>
              <option value="2">2 Levels</option>
              <option value="3">3 Levels</option>
              <option value="4">4 Levels</option>
              <option value="5">5 Levels</option>
            </select>
          )}
        </div>
      </div>
      {!isEditMode && (
        <div className="mb-4 text-right">
          <span className="text-lg font-semibold text-gray-700">
            Total URLs: {formatNumber(totalUrlCount)}
          </span>
        </div>
      )}
      {isEditMode && (
        <button
          onClick={() => addItem()}
          className="bg-green-500 text-white px-4 py-2 rounded-full mb-6 hover:bg-green-600 transition-colors"
        >
          <FaPlus className="inline mr-2" /> Add Root Item
        </button>
      )}
      <div className={`bg-gray-50 p-4 rounded-lg ${!isEditMode && 'shadow-inner'}`}>
        {sitemap.map((item) => (
          <SitemapItem
            key={item.id}
            item={item}
            onAdd={addItem}
            onDelete={deleteItem}
            onEdit={editItem}
            onMove={moveItem}
            onDuplicate={duplicateItem}
            isEditMode={isEditMode}
            depth={1}
            maxDepth={maxDepth}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
};

export default SitemapCreator;

