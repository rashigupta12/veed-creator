import React, { useRef, useState } from 'react';
import { Upload, Cloud, FileText, Video } from 'lucide-react';

const FileUploadComponent = ({ onFileUpload, multiple = true }) => {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    setFiles(uploadedFiles);
    
    if (onFileUpload) {
      onFileUpload(uploadedFiles);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles(droppedFiles);
    
    if (onFileUpload) {
      onFileUpload(droppedFiles);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div 
      className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 group"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple={multiple}
        accept="image/*,video/*"
        className="hidden"
      />
      
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="bg-blue-50 p-4 rounded-full group-hover:bg-blue-100 transition-colors duration-300">
          <Cloud className="w-12 h-12 text-blue-500 group-hover:text-blue-600 transition-colors" />
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-blue-800 mb-2">
            Upload Media Files
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Drag and drop or click to upload images and videos
          </p>
        </div>
        
        <button 
          onClick={triggerFileInput}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 shadow-md group"
        >
          <Upload className="w-5 h-5" />
          <span>Choose Files</span>
        </button>
      </div>
      
      {files.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-md font-semibold text-blue-700 mb-3">
            Selected Files
          </h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between bg-blue-50 p-3 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {file.type.startsWith('image/') ? (
                    <FileText className="w-6 h-6 text-blue-500" />
                  ) : (
                    <Video className="w-6 h-6 text-green-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadComponent;