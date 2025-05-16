import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs';
import ModelManager from './ModelManager';

class HealthAnalysisService {
  static MODEL_URL = `${window.location.protocol}//${window.location.hostname}:5000/weights`;
  static modelLoadProgress = 0;
  static modelLoadListeners = new Set();
  static modelsLoaded = false;
  static loadError = null;

  static addLoadProgressListener(callback) {
    if (callback) {
      this.modelLoadListeners.add(callback);
      // Send current progress immediately
      callback(this.modelLoadProgress);
    }
    return () => this.modelLoadListeners.delete(callback);
  }

  static updateLoadProgress(progress) {
    this.modelLoadProgress = progress;
    this.modelLoadListeners.forEach(cb => cb(progress));
  }

  static async loadModels() {
    if (this.modelsLoaded) {
      this.updateLoadProgress(100);
      return true;
    }

    try {
      this.updateLoadProgress(0);
      this.loadError = null;
      console.log('Starting model loading...', this.MODEL_URL);
        // Verify model URL is accessible
      try {
        const manifestUrl = `${this.MODEL_URL}/tiny_face_detector_model-weights_manifest.json`;
        console.log('Checking model manifest:', manifestUrl);
        const response = await fetch(manifestUrl, {
          headers: { Accept: 'application/json' }
        });
        
        const contentType = response.headers.get('content-type');
        console.log('Response content type:', contentType);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          console.error('Model manifest response:', response.status, response.statusText);
          const text = await response.text();
          console.error('Error response body:', text);
          throw new Error(`Failed to access model files at ${this.MODEL_URL} (${response.status})`);
        }
        
        const manifest = await response.json();
        console.log('Model manifest loaded successfully');
      } catch (error) {
        console.error('Failed to access model files:', error);
        this.loadError = error.message;
        throw new Error(`Cannot access model files: ${error.message}`);
      }
      
      // Load models sequentially for better progress tracking
      try {
        // Load TinyFaceDetector
        await faceapi.nets.tinyFaceDetector.loadFromUri(this.MODEL_URL);
        this.updateLoadProgress(30);
        console.log('TinyFaceDetector loaded');
        
        // Load FaceLandmark68Net
        await faceapi.nets.faceLandmark68Net.loadFromUri(this.MODEL_URL);
        this.updateLoadProgress(60);
        console.log('FaceLandmark68Net loaded');
        
        // Load FaceExpressionNet
        await faceapi.nets.faceExpressionNet.loadFromUri(this.MODEL_URL);
        this.updateLoadProgress(90);
        console.log('FaceExpressionNet loaded');
      } catch (modelError) {
        console.error('Failed to load specific models:', modelError);
        this.loadError = modelError.message;
        throw new Error(`Failed to load models: ${modelError.message}`);
      }
      
      // Final initialization
      this.modelsLoaded = true;
      this.updateLoadProgress(100);
      console.log('All models loaded successfully');
      return true;
    } catch (error) {
      console.error('Error in loadModels:', error);
      this.modelsLoaded = false;
      this.loadError = error.message;
      this.updateLoadProgress(0);
      throw error;
    }
  }

  static isModelLoaded() {
    return this.modelsLoaded && this.modelLoadProgress === 100;
  }

  static async analyzeImage(image) {
    if (!this.isModelLoaded()) {
      await this.loadModels();
    }

    try {
      // Create canvas from image for analysis
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);

      // Analyze facial features
      const facialAnalysis = await this.analyzeFace(canvas);
      if (!facialAnalysis) {
        throw new Error('Failed to analyze facial features');
      }

      // Get health indications and suggestions
      const healthIndications = await this.analyzeHealthIndications(facialAnalysis);
      const suggestions = this.generateAyurvedicSuggestions(healthIndications);

      return {
        facialAnalysis,
        healthIndications,
        ayurvedicSuggestions: suggestions
      };

    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    }
  }

  static async analyzeFace(canvas) {
    const detections = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    if (!detections || detections.length === 0) {
      return null;
    }

    const detection = detections[0];
    const landmarks = detection.landmarks;

    // Calculate additional metrics
    const eyeMetrics = this.calculateEyeMetrics(landmarks);
    const facialSymmetry = this.calculateFacialSymmetry(landmarks);

    return {
      emotion: {
        dominant: this.getDominantEmotion(detection.expressions),
        confidence: Math.max(...Object.values(detection.expressions)) * 100,
        breakdown: Object.entries(detection.expressions)
          .map(([emotion, level]) => ({ emotion, level: Math.round(level * 100) }))
      },
      physicalFeatures: {
        eyeStrain: eyeMetrics.strain,
        facialSymmetry,
        jawlineDefinition: this.analyzeJawline(landmarks),
        faceShape: this.analyzeFaceShape(landmarks)
      },
      doshaIndication: this.analyzeDoshaCharacteristics(landmarks, detection.expressions)
    };
  }

  static calculateEyeMetrics(landmarks) {
    const leftEyePoints = landmarks.getLeftEye();
    const rightEyePoints = landmarks.getRightEye();
    
    const leftEAR = this.calculateEyeAspectRatio(leftEyePoints);
    const rightEAR = this.calculateEyeAspectRatio(rightEyePoints);
    const avgEAR = (leftEAR + rightEAR) / 2;

    return {
      strain: {
        indication: avgEAR < 0.2 ? 'High' : avgEAR < 0.25 ? 'Moderate' : 'Normal',
        level: Math.round((0.3 - avgEAR) * 100)
      }
    };
  }

  static calculateEyeAspectRatio(eyePoints) {
    const height1 = this.distance(eyePoints[1], eyePoints[5]);
    const height2 = this.distance(eyePoints[2], eyePoints[4]);
    const width = this.distance(eyePoints[0], eyePoints[3]);
    return (height1 + height2) / (2 * width);
  }

  static distance(point1, point2) {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  }

  static getDominantEmotion(expressions) {
    return Object.entries(expressions).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }

  static analyzeDoshaCharacteristics(landmarks, expressions) {
    // Simplified dosha analysis based on facial features and expressions
    let vata = 0, pitta = 0, kapha = 0;

    // Face shape contribution
    const faceShape = this.analyzeFaceShape(landmarks);
    switch (faceShape.type) {
      case 'Oval':
        vata += 40; pitta += 30; kapha += 30;
        break;
      case 'Round':
        kapha += 40; vata += 30; pitta += 30;
        break;
      case 'Angular':
        pitta += 40; vata += 30; kapha += 30;
        break;
    }

    // Emotional contribution
    if (expressions.happy > 0.5) kapha += 10;
    if (expressions.angry > 0.3) pitta += 10;
    if (expressions.fearful > 0.3) vata += 10;

    // Normalize percentages
    const total = vata + pitta + kapha;
    return {
      scores: {
        vata: Math.round((vata / total) * 100),
        pitta: Math.round((pitta / total) * 100),
        kapha: Math.round((kapha / total) * 100)
      },
      primaryDosha: ['vata', 'pitta', 'kapha'].reduce((a, b) => 
        (this.getPrakrutiScore(a) > this.getPrakrutiScore(b) ? a : b)
      ),
      recommendations: this.getDoshaRecommendations()
    };
  }

  static getPrakrutiScore(dosha) {
    const scores = {
      vata: 33,
      pitta: 33,
      kapha: 34
    };
    return scores[dosha] || 0;
  }

  static getDoshaRecommendations() {
    return [
      "Follow a regular daily routine",
      "Practice gentle yoga and meditation",
      "Maintain a balanced diet according to your dosha",
      "Stay hydrated with warm water throughout the day",
      "Get adequate rest and sleep"
    ];
  }

  static calculateFacialSymmetry(landmarks) {
    const points = landmarks.positions;
    const midPoint = points[30]; // Nose tip
    
    // Calculate symmetry by comparing distances of paired points
    let symmetryScore = 0;
    const pairs = [
      [0, 16],  // Jaw points
      [2, 14],  // Jaw points
      [36, 45], // Eyes
      [39, 42], // Eyes
      [31, 35], // Nose
      [48, 54]  // Mouth
    ];

    pairs.forEach(([left, right]) => {
      const leftDist = this.distance(points[left], midPoint);
      const rightDist = this.distance(points[right], midPoint);
      const diff = Math.abs(leftDist - rightDist) / ((leftDist + rightDist) / 2);
      symmetryScore += (1 - diff) * 100;
    });

    symmetryScore = symmetryScore / pairs.length;
    
    return {
      score: Math.round(symmetryScore),
      quality: symmetryScore > 90 ? 'Excellent' : 
              symmetryScore > 80 ? 'Good' : 
              symmetryScore > 70 ? 'Fair' : 'Poor'
    };
  }

  static analyzeFaceShape(landmarks) {
    const points = landmarks.positions;
    const jawWidth = this.distance(points[0], points[16]);
    const faceHeight = this.distance(points[8], points[27]);
    const ratio = jawWidth / faceHeight;

    if (ratio > 0.78) return { type: 'Round' };
    if (ratio < 0.7) return { type: 'Oval' };
    return { type: 'Angular' };
  }

  static analyzeJawline(landmarks) {
    const points = landmarks.positions;
    const jawAngle = this.calculateJawAngle(points[0], points[8], points[16]);
    
    return {
      type: jawAngle > 120 ? 'Defined' : 
            jawAngle > 110 ? 'Moderate' : 'Soft',
      angle: Math.round(jawAngle)
    };
  }

  static calculateJawAngle(point1, point2, point3) {
    const ang = Math.atan2(
      point3.y - point2.y,
      point3.x - point2.x
    ) - Math.atan2(
      point1.y - point2.y,
      point1.x - point2.x
    );
    return Math.abs(ang * 180 / Math.PI);
  }

  static async analyzeHealthIndications(facialAnalysis) {
    const indications = [];
    
    if (!facialAnalysis) return indications;

    // Eye strain analysis
    if (facialAnalysis.physicalFeatures.eyeStrain.indication === 'High') {
      indications.push('Signs of eye strain detected - Consider reducing screen time');
    }

    // Facial symmetry analysis
    const symmetry = facialAnalysis.physicalFeatures.facialSymmetry;
    if (symmetry.score < 75) {
      indications.push('Facial muscle imbalance noted - May benefit from facial exercises');
    }

    // Emotional state analysis
    const emotion = facialAnalysis.emotion;
    if (emotion.dominant === 'stressed' || emotion.dominant === 'fearful') {
      indications.push('Stress indicators observed - Consider stress management techniques');
    }

    // Add general health observations
    indications.push('Regular facial exercises recommended for muscle tone');
    indications.push('Consider pranayama for overall wellness');

    return indications;
  }

  static generateAyurvedicSuggestions(healthIndications) {
    const suggestions = [];
    
    healthIndications.forEach(indication => {
      if (indication.includes('eye strain')) {
        suggestions.push('Practice Trataka (yogic eye exercises) daily');
        suggestions.push('Use Triphala eye wash under guidance');
      }
      
      if (indication.includes('stress')) {
        suggestions.push('Include Brahmi and Ashwagandha in your routine');
        suggestions.push('Practice Sheetali pranayama for cooling the mind');
      }
      
      if (indication.includes('muscle')) {
        suggestions.push('Regular facial massage with appropriate oils');
        suggestions.push('Practice facial yoga exercises');
      }
    });

    // Add general Ayurvedic recommendations
    suggestions.push('Follow dinacharya (daily routine) for balance');
    suggestions.push('Practice oil pulling in the morning');
    
    return suggestions;
  }
}

export default HealthAnalysisService;