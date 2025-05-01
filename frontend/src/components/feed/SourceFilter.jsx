import { useState } from 'react';

const SourceFilter = ({ onFilterChange }) => {
  const [activeSource, setActiveSource] = useState('all');
  
  const sources = [
    { id: 'all', label: 'All Sources' },
    { id: 'twitter', label: 'Twitter' },
    { id: 'reddit', label: 'Reddit' }
  ];
  
  const handleSourceClick = (sourceId) => {
    setActiveSource(sourceId);
    onFilterChange(sourceId === 'all' ? null : sourceId);
  };
  
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {sources.map((source) => (
        <button
          key={source.id}
          onClick={() => handleSourceClick(source.id)}
          className={`rounded-full px-4 py-1 text-sm transition-colors ${
            activeSource === source.id
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {source.label}
        </button>
      ))}
    </div>
  );
};

export default SourceFilter;