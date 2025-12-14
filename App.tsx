import React, { useState, useMemo, useEffect } from 'react';
import { extractCaptionFromUrl } from './services/geminiService';
import { ExtractedCaption, FormatOptions, LoadingState, HistoryItem } from './types';
import { formatCaption, copyToClipboard, downloadAsTxt } from './utils/textUtils';
import { MainInput } from './components/MainInput';
import { Button } from './components/Button';
import { HistorySidebar } from './components/HistorySidebar';
import { 
  Instagram, 
  Copy, 
  Download, 
  Settings2, 
  CheckCircle2, 
  Hash, 
  AtSign, 
  AlignVerticalSpaceAround,
  AlertCircle,
  Clock
} from 'lucide-react';

const App: React.FC = () => {
  // State
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentCaption, setCurrentCaption] = useState<ExtractedCaption | null>(null);
  const [copied, setCopied] = useState(false);
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Format Options State
  const [formatOptions, setFormatOptions] = useState<FormatOptions>({
    removeHashtags: false,
    removeMentions: false,
    removeBlankLines: false,
  });

  // Load history from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('reelscribe_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Compute displayed text based on toggles
  const displayText = useMemo(() => {
    if (!currentCaption) return '';
    return formatCaption(currentCaption.originalText, formatOptions);
  }, [currentCaption, formatOptions]);

  // Handlers
  const handleExtract = async (url: string) => {
    setLoadingState('loading');
    setErrorMsg(null);
    setCopied(false);
    setCurrentCaption(null);
    
    // Reset options to default for new extraction
    setFormatOptions({
      removeHashtags: false,
      removeMentions: false,
      removeBlankLines: false,
    });

    try {
      const text = await extractCaptionFromUrl(url);
      
      const newCaption: ExtractedCaption = {
        id: Date.now().toString(),
        url,
        originalText: text,
        timestamp: Date.now(),
      };

      setCurrentCaption(newCaption);
      setLoadingState('success');

      // Update History (Max 5 items)
      const updatedHistory = [newCaption, ...history].slice(0, 5);
      setHistory(updatedHistory);
      localStorage.setItem('reelscribe_history', JSON.stringify(updatedHistory));

    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
      setLoadingState('error');
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setCurrentCaption(item);
    setFormatOptions({
      removeHashtags: false,
      removeMentions: false,
      removeBlankLines: false,
    });
    setErrorMsg(null);
    setLoadingState('success');
  };

  const handleCopy = async () => {
    if (!displayText) return;
    const success = await copyToClipboard(displayText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!displayText) return;
    downloadAsTxt(displayText, `reel-caption-${Date.now()}.txt`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-1.5 rounded-lg text-white shadow-md">
              <Instagram size={20} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600 tracking-tight">
              ReelScribe
            </span>
          </div>
          
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all"
          >
            <Clock size={18} />
            <span className="hidden sm:inline font-medium">History</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12 max-w-5xl relative z-10">
        
        <div className="text-center mb-10 animate-fadeIn">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Extract <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-600">Reel Captions</span> in Seconds
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Paste an Instagram Reel link below to instantly get the full caption, emojis, and hashtags. 
            <span className="hidden sm:inline"> No login required.</span>
          </p>
        </div>

        {/* Input Section */}
        <div className="mb-12">
          <MainInput 
            onExtract={handleExtract} 
            isLoading={loadingState === 'loading'} 
          />
          {errorMsg && (
            <div className="mt-6 max-w-2xl mx-auto animate-fadeIn">
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start text-red-700 shadow-sm">
                <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Extraction Failed</h3>
                  <p className="text-sm opacity-90">{errorMsg}</p>
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-400">
                  Tip: Ensure the reel is public. Very recent reels might take a few minutes to be searchable.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Result Section */}
        {currentCaption && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeInUp">
            
            {/* Left: Options Panel */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-2 mb-4 text-gray-800 font-semibold">
                  <Settings2 className="w-5 h-5 text-purple-500" />
                  <h3>Refine Output</h3>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-pink-500 rounded border-gray-300 focus:ring-pink-500"
                      checked={formatOptions.removeHashtags}
                      onChange={(e) => setFormatOptions(prev => ({ ...prev, removeHashtags: e.target.checked }))}
                    />
                    <div className="flex items-center text-gray-700">
                      <Hash className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Remove Hashtags</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-pink-500 rounded border-gray-300 focus:ring-pink-500"
                      checked={formatOptions.removeMentions}
                      onChange={(e) => setFormatOptions(prev => ({ ...prev, removeMentions: e.target.checked }))}
                    />
                    <div className="flex items-center text-gray-700">
                      <AtSign className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Remove Mentions</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-pink-500 rounded border-gray-300 focus:ring-pink-500"
                      checked={formatOptions.removeBlankLines}
                      onChange={(e) => setFormatOptions(prev => ({ ...prev, removeBlankLines: e.target.checked }))}
                    />
                    <div className="flex items-center text-gray-700">
                      <AlignVerticalSpaceAround className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Remove Blank Lines</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="hidden lg:block bg-purple-50 p-6 rounded-2xl border border-purple-100 shadow-sm">
                 <h4 className="font-semibold text-purple-900 mb-2">Pro Tip</h4>
                 <p className="text-sm text-purple-800 leading-relaxed">
                   The original formatting is preserved by default. Use the toggles above to clean up the text instantly.
                 </p>
              </div>
            </div>

            {/* Right: Output Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full min-h-[400px] transition-all hover:shadow-xl">
                
                {/* Output Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Generated Caption</span>
                  <div className="flex space-x-2 h-6">
                     {copied && (
                       <span className="text-sm text-green-600 font-medium flex items-center animate-pulse">
                         <CheckCircle2 className="w-4 h-4 mr-1" /> Copied!
                       </span>
                     )}
                  </div>
                </div>

                {/* Text Area */}
                <div className="flex-grow p-6 relative">
                  <textarea
                    readOnly
                    value={displayText}
                    className="w-full h-full min-h-[300px] resize-none focus:outline-none text-gray-800 text-base leading-relaxed bg-transparent custom-scrollbar font-mono text-sm"
                    spellCheck={false}
                  />
                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-3 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={handleDownload}
                    icon={<Download size={18} />}
                  >
                    Download .txt
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleCopy}
                    icon={<Copy size={18} />}
                  >
                    {copied ? 'Copied' : 'Copy Text'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Sidebar */}
      <HistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history} 
        onSelect={handleHistorySelect} 
      />

      {/* Footer */}
      <footer className="py-6 text-center text-gray-400 text-sm border-t border-gray-100 mt-auto bg-white">
        <p>© {new Date().getFullYear()} ReelScribe. Powered by Gemini.</p>
      </footer>
    </div>
  );
};

export default App;