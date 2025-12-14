import React from 'react';
import { HistoryItem } from '../types';
import { Clock, X, ChevronRight } from 'lucide-react';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose, history, onSelect }) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Panel */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center text-gray-800 font-semibold">
            <Clock className="w-5 h-5 mr-2 text-pink-500" />
            <h3>History</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-60px)] p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              <p>No history yet.</p>
              <p className="text-sm">Extract a reel to see it here.</p>
            </div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="w-full text-left bg-gray-50 hover:bg-white border border-gray-100 hover:border-pink-200 p-3 rounded-xl transition-all shadow-sm hover:shadow-md group"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-mono text-gray-400 truncate max-w-[150px] block">
                    {new URL(item.url).pathname}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                  {item.originalText}
                </p>
                <div className="mt-2 flex items-center text-xs text-pink-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Load this caption <ChevronRight className="w-3 h-3 ml-1" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
};