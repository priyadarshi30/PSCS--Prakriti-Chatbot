import React, { useRef, useState, useEffect } from 'react';
import HealthAnalysisService from '../services/HealthAnalysisService';

// Make service available globally for error handling
if (typeof window !== 'undefined') {
  window.healthAnalysisService = HealthAnalysisService;
}

export const ImageInput = ({ 
  onImageSelect, 
  maxSize = 5, 
  allowedTypes = ['image/jpeg', 'image/png'], 
  initialMode = 'upload' 
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [modelProgress, setModelProgress] = useState(0);
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);  useEffect(() => {
    let mounted = true;
    let timeoutId;

    const loadModels = async () => {
      // Only load models if we're in camera mode
      if (initialMode !== 'camera') {
        return null;
      }

      try {
        const unsubscribe = HealthAnalysisService.addLoadProgressListener(progress => {
          if (mounted) {
            setModelProgress(progress);
            if (progress === 100) {
              setError(null);
            }
          }
        });

        if (!HealthAnalysisService.isModelLoaded()) {
          timeoutId = setTimeout(() => {
            if (mounted && !HealthAnalysisService.isModelLoaded()) {
              setError('Model loading is taking longer than expected. Please check your internet connection.');
            }
          }, 15000);

          try {
            await HealthAnalysisService.loadModels();
            if (mounted) {
              setError(null);
            }
          } catch (error) {
            console.error('Model loading error:', error);
            if (mounted) {
              setError('Failed to load facial analysis models. Please try again.');
            }
          } finally {
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
          }
        }

        return unsubscribe;
      } catch (err) {
        console.error('Failed to load models:', err);
        if (mounted) {
          setError('Failed to load analysis models. Please refresh the page.');
        }
        return null;
      }
    };

    const unsubscribePromise = loadModels();    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      unsubscribePromise.then(unsubscribe => unsubscribe?.());
      stopCamera();
    };
  }, []);
    useEffect(() => {
    let mounted = true;

    const initializeCamera = async () => {
      if (initialMode === 'camera' && mounted) {
        try {
          // First ensure models are loaded
          if (!HealthAnalysisService.isModelLoaded()) {
            console.log('Loading models before camera initialization...');
            try {
              await HealthAnalysisService.loadModels();
            } catch (modelError) {
              console.error('Model loading error:', modelError);
              if (mounted) {
                setError(`Failed to load facial analysis models: ${modelError.message}`);
                setIsCapturing(false);
              }
              return;
            }
          }

          // Once models are loaded, start camera
          await startCamera();
          if (mounted) {
            setIsCapturing(true);
            setError(null);
          }
        } catch (error) {
          console.error('Camera initialization error:', error);
          if (mounted) {
            setError(`Camera error: ${error.message}`);
            setIsCapturing(false);
          }
        }
      } else {
        stopCamera();
        setIsCapturing(false);
      }
    };

    initializeCamera();

    return () => {
      mounted = false;
    };
  }, [initialMode]);

  const checkBrowserSupport = () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera not supported in this browser');
      return false;
    }
    return true;
  };

  const isRefValid = (ref) => {
    return ref.current !== null;
  };  const startCamera = async () => {
    try {
      if (!checkBrowserSupport()) {
        return;
      }

      // Stop any existing streams first
      stopCamera();
      
      setError(null);
      setLoading(true);
      
      // First initialize the models
      if (!HealthAnalysisService.isModelLoaded()) {
        try {
          console.log('Loading models before camera initialization...');
          await HealthAnalysisService.loadModels();
        } catch (modelError) {
          console.error('Model loading error:', modelError);
          throw new Error(`Failed to load analysis models: ${modelError.message}`);
        }
      }
      
      // Once models are loaded, initialize camera
      try {
        console.log('Requesting camera permissions...');
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        // Once we have camera access, initialize the models
        if (!HealthAnalysisService.isModelLoaded()) {
          try {
            await HealthAnalysisService.loadModels();
          } catch (modelError) {
            throw new Error('Failed to load analysis models. Please refresh and try again.');
          }
        }

        // Set up video element
        if (!videoRef.current) {
          throw new Error('Video element not initialized');
        }

        const videoElement = videoRef.current;
        videoElement.srcObject = mediaStream;
        
        // Wait for video to be ready
        await new Promise((resolve, reject) => {
          videoElement.onloadedmetadata = () => {
            videoElement.play()
              .then(resolve)
              .catch(reject);
          };
          videoElement.onerror = () => reject(new Error('Failed to load video'));
          
          // Add a timeout in case the video never loads
          setTimeout(() => reject(new Error('Video load timeout')), 10000);
        });

        setStream(mediaStream);
        setIsCapturing(true);
        setLoading(false);
        
      } catch (streamError) {
        console.error('Camera access error:', streamError);
        throw new Error('Unable to access camera. Please check permissions and try again.');
      }
    } catch (error) {
      console.error('Camera initialization error:', error);
      setError(error.message || 'Failed to initialize camera');
      setIsCapturing(false);
      setLoading(false);
      stopCamera();
    }
  };
  useEffect(() => {
    let mounted = true;
    
    const initCamera = async () => {
      if (initialMode === 'camera' && mounted) {
        // Check if models are loaded before starting camera
        if (!HealthAnalysisService.isModelLoaded()) {
          // Wait for models to load with a timeout
          try {
            const timeout = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Model loading timeout')), 30000));
            
            await Promise.race([
              new Promise(resolve => {
                const checkModels = () => {
                  if (HealthAnalysisService.isModelLoaded()) {
                    resolve();
                  } else {
                    setTimeout(checkModels, 500);
                  }
                };
                checkModels();
              }),
              timeout
            ]);
          } catch (error) {
            if (mounted) {
              setError('Model loading took too long. Please refresh the page.');
            }
            return;
          }
        }
        
        if (mounted) {
          await startCamera();
        }
      }
    };

    initCamera();
    
    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [initialMode, stream]);

  useEffect(() => {
    return () => {
      // Cleanup function to ensure camera is stopped when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  const captureImage = async () => {
    try {
      // First check if all dependencies are loaded
      if (typeof window.healthAnalysisService?.isModelLoaded !== 'function') {
        throw new Error('Health analysis model is not ready. Please wait a moment and try again.');
      }
      
      if (!window.healthAnalysisService.isModelLoaded()) {
        throw new Error('Health analysis model is still loading. Please wait a moment and try again.');
      }

      if (!isRefValid(videoRef) || !isRefValid(canvasRef)) {
        throw new Error('Camera or canvas not initialized');
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');

      if (!video || !context) {
        throw new Error('Failed to initialize camera components');
      }

      if (!video.videoWidth || !video.videoHeight) {
        throw new Error('Video stream not ready');
      }

      // Set canvas size to match video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Apply image processing settings
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';

      // Draw the video frame on the canvas
      context.save();
      const isVideoMirrored = video.style.transform.includes('scaleX(-1)');
      if (isVideoMirrored) {
        // If video is mirrored, flip the canvas to match
        context.scale(-1, 1);
        context.translate(-canvas.width, 0);
      }
      context.drawImage(video, 0, 0);
      context.restore();      // Create and process image
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        onImageSelect(img);
        stopCamera(); // Stop camera after successful capture
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        setError('Failed to process captured image');
      };

      canvas.toBlob(
        (blob) => {
          if (blob) {
            img.src = URL.createObjectURL(blob);
          } else {
            setError('Failed to capture image');
          }
        },
        'image/jpeg',
        0.95
      );
    } catch (error) {
      console.error('Capture error:', error);
      setError(error.message || 'Failed to capture image');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const validateFile = (file) => {
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPG or PNG');
      return false;
    }
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File too large. Maximum size is ${maxSize}MB`);
      return false;
    }
    return true;
  };
  const handleFileUpload = async (event) => {
    setError(null);
    setLoading(true);
    const file = event.target.files?.[0];
    let objectUrl = null;
    
    try {
      if (!file) {
        throw new Error('No file selected');
      }

      if (!validateFile(file)) {
        setLoading(false);
        return;
      }

      // Load models if not already loaded
      if (!HealthAnalysisService.isModelLoaded()) {
        try {
          setModelProgress(0);
          console.log('Loading models for image analysis...');
          const unsubscribe = HealthAnalysisService.addLoadProgressListener(progress => {
            setModelProgress(progress);
          });
          await HealthAnalysisService.loadModels();
          unsubscribe();
        } catch (modelError) {
          throw new Error(`Failed to load analysis models: ${modelError.message}`);
        }
      }

      const img = new Image();
      objectUrl = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = objectUrl;
      });

      await onImageSelect(img);
      
    } catch (error) {
      console.error('File upload error:', error);
      setError(error.message || 'Failed to process image');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    }
  };
  const handleCapture = async () => {
    if (!isRefValid(videoRef) || !isRefValid(canvasRef)) {
      setError('Camera not properly initialized');
      return;
    }

    if (!HealthAnalysisService.isModelLoaded()) {
      setError('Analysis models are not ready. Please wait a moment.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!video.videoWidth || !video.videoHeight) {
        throw new Error('Video stream not ready');
      }

      // Set canvas dimensions to match video feed
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame on canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to image
      const image = new Image();
      image.src = canvas.toDataURL('image/jpeg');

      // Wait for image to load before passing it
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      // Pass the captured image to parent component
      onImageSelect(image);

      // Stop the camera after capture
      stopCamera();
    } catch (err) {
      console.error('Error capturing image:', err);
      setError('Failed to capture image. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleFileDrop = async (event) => {
    event.preventDefault();
    setError(null);
    setIsFocused(false);
    setLoading(true);
    let objectUrl = null;

    try {
      const files = event.dataTransfer.files;
      if (files.length === 0) {
        throw new Error('No file was dropped');
      }

      const file = files[0];
      
      if (!validateFile(file)) {
        setLoading(false);
        return;
      }

      // Load models if not already loaded
      if (!HealthAnalysisService.isModelLoaded()) {
        try {
          setModelProgress(0);
          console.log('Loading models for image analysis...');
          const unsubscribe = HealthAnalysisService.addLoadProgressListener(progress => {
            setModelProgress(progress);
          });
          await HealthAnalysisService.loadModels();
          unsubscribe();
        } catch (modelError) {
          throw new Error(`Failed to load analysis models: ${modelError.message}`);
        }
      }

      const img = new Image();
      objectUrl = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = objectUrl;
      });

      await onImageSelect(img);

    } catch (error) {
      console.error('Error processing dropped file:', error);
      setError(error.message || 'Failed to process the image. Please try again.');
    } finally {
      setLoading(false);
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    }
  };  const handleImageFile = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: file.type });
      const img = new Image();
      const objectUrl = URL.createObjectURL(blob);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = objectUrl;
      });

      if (typeof onImageSelect !== 'function') {
        throw new Error('onImageSelect callback not provided');
      }

      await onImageSelect(img);
      URL.revokeObjectURL(objectUrl);
      
    } catch (error) {
      console.error('Error processing image file:', error);
      throw error;
    }
  };

  return (
    <div className="image-input-container">
      {error && <div className="error-message">{error}</div>}
        {isCapturing && modelProgress < 100 && (
        <div className="model-loading">
          Loading analysis models... {modelProgress}%
          <div className="progress-bar">
            <div className="progress" style={{ width: `${modelProgress}%` }}></div>
          </div>
        </div>
      )}

      {isCapturing ? (
        <div className="camera-container">
          {loading && (
            <div className="camera-loading">
              <div className="loading-spinner"></div>
              <p>Initializing camera...</p>
            </div>
          )}
          <video
            ref={videoRef}
            className="camera-preview"
            autoPlay
            playsInline
            muted
            width={640}
            height={480}
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)'
            }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <div className="camera-controls">
            <button 
              className="capture-button" 
              onClick={handleCapture}
              disabled={loading || modelProgress < 100}
            >
              {loading ? '📸 Processing...' : '📸 Capture'}
            </button>
            <button 
              className="cancel-button" 
              onClick={() => {
                stopCamera();
                setIsCapturing(false);
              }}
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      ) : (
        <div 
          className={`file-input-area ${isFocused ? 'focused' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsFocused(true);
          }}
          onDragLeave={() => setIsFocused(false)}
          onDrop={(e) => handleFileDrop(e)}
        >        <div className="button-group">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="file-input"
              id="file-input"
              ref={fileInputRef}
            />
            <label 
              htmlFor="file-input" 
              className={`upload-button ${loading ? 'disabled' : ''}`}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Processing...' : 'Upload Image'}
            </label>
            <button 
              className="camera-button" 
              onClick={() => {
                setIsCapturing(true);
                startCamera();
              }}
              disabled={loading || (isCapturing && modelProgress < 100)}
            >
              📷 Start Camera
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <style jsx>{`
        .error-message {
          color: #dc3545;
          margin: 10px auto;
          padding: 15px;
          border-radius: 8px;
          background-color: rgba(220, 53, 69, 0.1);
          text-align: center;
          max-width: 400px;
        }
        .retry-button {
          margin-top: 10px;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          background: #dc3545;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .retry-button:hover {
          background: #bd2130;
          transform: translateY(-1px);
        }
        .image-input-container {
          margin: 20px;
          padding: 20px;
          border-radius: 8px;
          background: #f5f5f5;
        }
        .button-group {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }
        .upload-button {
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          background: #007bff;
          color: white;
          border: none;
        }
        .file-input {
          display: none;
        }
        .camera-container {
          position: relative;
          width: 100%;
          max-width: 640px;
          height: 480px;
          margin: 0 auto;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
        }
        .camera-loading {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          z-index: 10;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s infinite linear;
          margin-bottom: 15px;
        }
        .camera-preview {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1);
          background: #000;
        }
        .camera-controls {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          gap: 15px;
          padding: 15px;
          background: rgba(0, 0, 0, 0.5);
        }
        .capture-button, .cancel-button {
          padding: 12px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          transition: all 0.2s ease;
          border: none;
          min-width: 140px;
        }
        .capture-button {
          background: #007bff;
          color: white;
        }
        .cancel-button {
          background: #dc3545;
          color: white;
        }
        .capture-button:hover:not(:disabled),
        .cancel-button:hover:not(:disabled) {
          transform: translateY(-1px);
          opacity: 0.9;
        }
        .capture-button:disabled {
          background: #cccccc;
          cursor: not-allowed;
          opacity: 0.7;
        }
        .camera-loading {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          font-size: 1.2rem;
        }        .focus-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          pointer-events: none;
          color: white;
          font-size: 1.2rem;
        }
        .focus-overlay.focused {
          background: transparent;
        }
        .focus-guide {
          width: 90%;
          height: 90%;
          border: 3px solid rgba(255, 255, 255, 0.5);
          border-radius: 8px;
          margin: 20px auto;
        }
        .focus-text {
          background: rgba(0, 0, 0, 0.5);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 1rem;
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
        }        .camera-controls {
          margin-top: 20px;
          display: flex;
          justify-content: center;
          gap: 15px;
          padding: 15px;
        }
        .camera-preview {
          display: block;
          width: 100%;
          height: auto;
          transform: scaleX(-1); /* Mirror the camera */
          border-radius: 8px;
        }
        .capture-button, .cancel-button {
          padding: 12px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          transition: all 0.2s ease;
          border: none;
          min-width: 140px;
        }
        .capture-button {
          background: #007bff;
          color: white;
        }
        .capture-button:hover:not(:disabled) {
          background: #0056b3;
          transform: translateY(-1px);
        }
        .capture-button:disabled {
          background: #cccccc;
          cursor: not-allowed;
          opacity: 0.7;
        }
        .cancel-button {
          background: #f8f9fa;
          color: #dc3545;
          border: 1px solid #dc3545;
        }
        .cancel-button:hover {
          background: #dc3545;
          color: white;
        }
        .error-message {
          color: #dc3545;
          margin-top: 10px;
          padding: 10px;
          border-radius: 5px;
          background-color: rgba(220, 53, 69, 0.1);
        }
        .loading-spinner {
          text-align: center;
          padding: 20px;
        }
        .model-loading {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          font-size: 1.2rem;
          z-index: 5;
        }

        .progress-bar {
          width: 80%;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          margin-top: 15px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50, #8BC34A);
          transition: width 0.3s ease;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s infinite linear;
          margin-bottom: 15px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .camera-button {
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          background: #28a745;
          color: white;
          border: none;
          transition: all 0.2s ease;
        }
        .camera-button:hover:not(:disabled) {
          background: #218838;
          transform: translateY(-1px);
        }
        .camera-button:disabled {
          background: #cccccc;
          cursor: not-allowed;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
};
