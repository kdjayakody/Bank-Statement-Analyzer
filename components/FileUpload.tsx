
import React, { useCallback, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  onProcess: () => void;
  onClear: () => void;
  isProcessing: boolean;
  selectedFileCount: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFilesSelect, 
  onProcess,
  onClear,
  isProcessing, 
  selectedFileCount 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFilesSelect(Array.from(event.target.files));
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      onFilesSelect(Array.from(event.dataTransfer.files));
      event.dataTransfer.clearData();
    }
  }, [onFilesSelect]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div 
        className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-300 bg-slate-50 dark:bg-slate-700/50"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={triggerFileSelect}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isProcessing}
        />
        <div className="flex flex-col items-center justify-center">
            <UploadIcon className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-4"/>
            <p className="text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">PNG, JPG, GIF up to 10MB</p>
        </div>
      </div>
      
      {selectedFileCount > 0 && (
        <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
          <p>{selectedFileCount} file(s) selected.</p>
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button 
            onClick={onProcess} 
            disabled={isProcessing || selectedFileCount === 0}
            className="w-full sm:w-auto px-8 py-3 text-base font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-300"
        >
            {isProcessing ? 'Processing...' : 'Extract Data'}
        </button>
        <button 
            onClick={onClear} 
            disabled={isProcessing}
            className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-300"
        >
            Clear
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
