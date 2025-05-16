import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs';

class ModelManager {
  static modelsLoaded = false;
  static isLoading = false;
  static loadedModels = new Set();
  static MODEL_URL = 'http://localhost:5000/public/weights';
  static bodyModel = null;
  static lastError = null;
  static progressCallback = null;

  static getModelStatus() {
    return {
      isLoaded: this.modelsLoaded,
      isLoading: this.isLoading,
      loadedCount: this.loadedModels.size
    };
  }

  static setProgressCallback(callback) {
    this.progressCallback = callback;
  }

  static updateProgress(progress) {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  static async verifyModel(modelName, net) {
    if (this.loadedModels.has(modelName)) {
      try {
        if (net.params) {
          console.log(`${modelName} verified - already loaded`);
          return true;
        }
      } catch (error) {
        console.log(`${modelName} lost, needs reload`);
        this.loadedModels.delete(modelName);
      }
    }
    return false;
  }

  static async loadModel(model, totalModels, currentModelIndex) {
    try {
      if (await this.verifyModel(model.name, model.net)) {
        const progress = Math.round((currentModelIndex + 1) * (100 / totalModels));
        this.updateProgress(progress);
        return true;
      }

      console.log(`Loading ${model.name}...`);
      await model.net.loadFromUri(this.MODEL_URL);
      
      // Verify the model was actually loaded
      try {
        if (model.net.params) {
          console.log(`${model.name} loaded successfully`);
          this.loadedModels.add(model.name);
          const progress = Math.round((currentModelIndex + 1) * (100 / totalModels));
          this.updateProgress(progress);
          return true;
        }
      } catch (error) {
        throw new Error(`${model.name} failed verification after load`);
      }

    } catch (error) {
      console.error(`Failed to load ${model.name}:`, error);
      this.loadedModels.delete(model.name);
      throw error;
    }
  }

  static async loadModels() {
    if (this.isLoading) {
      console.log('Model loading already in progress...');
      return false;
    }

    if (this.modelsLoaded) {
      console.log('Models already loaded');
      this.updateProgress(100);
      return true;
    }

    try {
      this.isLoading = true;
      this.lastError = null;
      this.updateProgress(0);

      const models = [
        { 
          net: faceapi.nets.tinyFaceDetector,
          name: 'Face Detector'
        },
        { 
          net: faceapi.nets.faceLandmark68Net,
          name: 'Face Landmarks'
        },
        { 
          net: faceapi.nets.faceExpressionNet,
          name: 'Face Expression'
        }
      ];

      // Load models sequentially for better error handling
      for (let i = 0; i < models.length; i++) {
        const model = models[i];
        try {
          await this.loadModel(model, models.length, i);
        } catch (error) {
          console.error(`Failed to load ${model.name}:`, error);
          this.lastError = error;
          this.isLoading = false;
          this.modelsLoaded = false;
          this.updateProgress(0);
          throw error;
        }
      }

      this.modelsLoaded = true;
      this.isLoading = false;
      this.updateProgress(100);
      console.log('All models loaded successfully');
      return true;

    } catch (error) {
      console.error('Error in loadModels:', error);
      this.lastError = error;
      this.isLoading = false;
      this.modelsLoaded = false;
      this.updateProgress(0);
      throw error;
    }
  }

  static async loadBodyModel() {
    try {
      if (!this.bodyModel) {
        console.log('Loading body analysis model...');
        this.bodyModel = await tf.loadLayersModel(`${this.MODEL_URL}/body_model/model.json`);
        console.log('Body model loaded successfully');
      }
      return true;
    } catch (error) {
      console.error('Failed to load body model:', error);
      this.bodyModel = null;
      return false;
    }
  }

  static async getBodyModel() {
    if (!this.bodyModel) {
      await this.loadBodyModel();
    }
    return this.bodyModel;
  }

  static async resetModels() {
    this.modelsLoaded = false;
    this.isLoading = false;
    this.loadedModels.clear();
    if (this.bodyModel) {
      this.bodyModel.dispose();
      this.bodyModel = null;
    }
  }
}

export default ModelManager;
