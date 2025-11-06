import { useState } from 'react';
import Header from './components/Header.jsx';
import ContiguousSimulator from './components/ContiguousSimulator.jsx';
import PagingSimulator from './components/PagingSimulator.jsx';
import SiteFooter from './components/SiteFooter.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('contiguous');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100 flex flex-col">
      <Header activeTab={activeTab} onChangeTab={setActiveTab} />

      <main className="container mx-auto px-4 py-8 flex-1 w-full max-w-6xl">
        {activeTab === 'contiguous' ? (
          <ContiguousSimulator />
        ) : (
          <PagingSimulator />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
