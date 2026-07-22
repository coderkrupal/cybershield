import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import FileInspectors from './pages/FileInspectors';
import IncidentPortal from './pages/IncidentPortal';
import CanaryManager from './pages/CanaryManager';
import SafetyGuide from './pages/SafetyGuide';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'files':
        return <FileInspectors />;
      case 'incidents':
        return <IncidentPortal />;
      case 'canary':
        return <CanaryManager />;
      case 'guide':
        return <SafetyGuide />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{ flex: 1, paddingBottom: '40px' }}>
        {renderActivePage()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
