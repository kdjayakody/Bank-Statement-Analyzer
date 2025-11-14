
import React, { useState, useCallback, useEffect } from 'react';
import { Transaction } from './types';
import { extractTransactions } from './services/geminiService';
import FileUpload from './components/FileUpload';
import StatementTable from './components/StatementTable';
import Loader from './components/Loader';

// For TypeScript to recognize the aistudio object on the window
// Fix: Use a named interface `AIStudio` to avoid conflicting with other global declarations.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);

  useEffect(() => {
    const checkApiKey = async () => {
      if (await window.aistudio.hasSelectedApiKey()) {
        setApiKeySelected(true);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Optimistically assume key is selected to avoid race conditions
      // where hasSelectedApiKey() might not be immediately true.
      setApiKeySelected(true);
      setError(null);
    } catch (e) {
      console.error("Error opening API key selection:", e);
      setError("Could not open the API key selection dialog.");
    }
  };

  const handleFilesSelect = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setTransactions([]);
    setError(null);
  }, []);
  
  const handleClear = useCallback(() => {
    setFiles([]);
    setTransactions([]);
    setError(null);
    setIsLoading(false);
  }, []);

  const processStatements = useCallback(async () => {
    if (files.length === 0) {
      setError("Please select at least one bank statement image.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTransactions([]);

    try {
      const extractedData = await extractTransactions(files);
      setTransactions(extractedData);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during processing.";
      // Check for specific API key error message
      if (errorMessage.includes("API key not valid") || errorMessage.includes("Requested entity was not found")) {
        setError("Your API key appears to be invalid. Please select a valid API key to continue.");
        setApiKeySelected(false); // Reset to show the select key UI
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [files]);

  const ApiKeySelectionScreen = () => (
    <div className="w-full max-w-5xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-12 ring-1 ring-slate-200 dark:ring-slate-700 flex flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
        Provide Your Gemini API Key
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
        This application requires a Google Gemini API key to process your bank statements. Your key is securely handled and used only for your session.
      </p>
      <button
        onClick={handleSelectKey}
        className="px-8 py-3 text-base font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-300"
      >
        Select API Key
      </button>
       {error && (
          <div className="mt-6 p-3 bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 rounded-lg text-sm">
            <p>{error}</p>
          </div>
        )}
      <p className="text-xs text-slate-500 dark:text-slate-500 mt-4">
        For more information, see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Gemini billing documentation</a>.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <header className="w-full max-w-5xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400 mb-2">
          Bank Statement Analyzer
        </h1>
        <p className="text-md sm:text-lg text-slate-600 dark:text-slate-400">
          Upload your bank statement images and let Gemini AI extract the data for you.
        </p>
      </header>

      {apiKeySelected ? (
        <main className="w-full max-w-5xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8 ring-1 ring-slate-200 dark:ring-slate-700">
          <FileUpload 
            onFilesSelect={handleFilesSelect} 
            onProcess={processStatements}
            onClear={handleClear}
            isProcessing={isLoading}
            selectedFileCount={files.length}
          />
          
          {isLoading && <Loader />}
          
          {error && (
            <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 rounded-lg text-center">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          {!isLoading && transactions.length > 0 && (
            <div className="mt-8">
               <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">Extracted Transactions</h2>
              <StatementTable transactions={transactions} />
            </div>
          )}

          {!isLoading && transactions.length === 0 && !error && files.length > 0 && (
               <div className="mt-6 text-center text-slate-500 dark:text-slate-400">
                  <p>Ready to process. Click the "Extract Data" button above.</p>
              </div>
          )}
        </main>
      ) : (
        <ApiKeySelectionScreen />
      )}


       <footer className="w-full max-w-5xl text-center mt-8 text-sm text-slate-500 dark:text-slate-500">
          <p>Powered by Google Gemini. For demonstration purposes only.</p>
        </footer>
    </div>
  );
};

export default App;
