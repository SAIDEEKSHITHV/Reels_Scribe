import React, { useState } from 'react';
import { Search, Link2 } from 'lucide-react';
import { Button } from './Button';

interface MainInputProps {
  onExtract: (url: string) => void;
  isLoading: boolean;
}

export const MainInput: React.FC<MainInputProps> = ({ onExtract, isLoading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onExtract(url.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center">
          <div className="absolute left-4 text-gray-400 group-focus-within:text-pink-500 transition-colors">
            <Link2 className="w-5 h-5" />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste Instagram Reel Link (e.g., https://instagram.com/reel/...)"
            className="w-full pl-12 pr-32 py-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/10 transition-all text-base md:text-lg"
            required
            disabled={isLoading}
          />
          <div className="absolute right-2">
            <Button 
              type="submit" 
              isLoading={isLoading} 
              disabled={!url || isLoading}
              className="rounded-xl px-6"
            >
              {isLoading ? 'Extracting...' : 'Extract'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};