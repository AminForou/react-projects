import React, { useEffect, useState } from 'react';
import { FaTable, FaChartBar, FaUsers } from 'react-icons/fa';

const Sidebar = ({ isOpen, toggleSidebar, activeView, setActiveView }) => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.pageYOffset);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const sidebarStyle = {
    ...styles.sidebar,
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    top: scrollPosition > 64 ? '0px' : '64px',
    transition: 'transform 0.3s ease-in-out, top 0.3s ease-in-out',
  };

  return (
    <div style={sidebarStyle}>
      <button onClick={toggleSidebar} style={styles.closeButton}>×</button>
      <div style={styles.menuItems}>
        <button 
          onClick={() => setActiveView('keywordTable')}
          style={{
            ...styles.menuItem,
            backgroundColor: activeView === 'keywordTable' ? '#6a0dad' : 'transparent',
            color: activeView === 'keywordTable' ? 'white' : '#333'
          }}
        >
          <FaTable style={styles.icon} /> Keyword Table
        </button>
        <button 
          onClick={() => setActiveView('categoryAnalysis')}
          style={{
            ...styles.menuItem,
            backgroundColor: activeView === 'categoryAnalysis' ? '#6a0dad' : 'transparent',
            color: activeView === 'categoryAnalysis' ? 'white' : '#333'
          }}
        >
          <FaChartBar style={styles.icon} /> Category Analysis
        </button>
        <button 
          onClick={() => setActiveView('competitorAnalysis')}
          style={{
            ...styles.menuItem,
            backgroundColor: activeView === 'competitorAnalysis' ? '#6a0dad' : 'transparent',
            color: activeView === 'competitorAnalysis' ? 'white' : '#333'
          }}
        >
          <FaUsers style={styles.icon} /> Competitor Analysis
        </button>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    position: 'fixed',
    left: 0,
    bottom: 0,
    width: '250px',
    backgroundColor: '#f8f9fa',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
  },
  closeButton: {
    alignSelf: 'flex-end',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '10px',
    color: '#333',
  },
  menuItems: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '15px 20px',
    border: 'none',
    borderRadius: '0',
    textAlign: 'left',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, color 0.3s ease',
    marginBottom: '5px',
  },
  icon: {
    marginRight: '10px',
    fontSize: '18px',
  },
};

export default Sidebar;
