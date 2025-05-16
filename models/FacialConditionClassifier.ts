import * as tf from '@tensorflow/tfjs';
import { FacialCondition, Severity } from '../types/conditions';

export class FacialConditionClassifier {
  private model: tf.LayersModel;
  private isModelReady: boolean = false;
  private readonly CONDITIONS = ['acne', 'dark_spots', 'wrinkles', 'dryness', 'oily'];

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    try {
      this.model = this.buildModel();
      this.isModelReady = true;
    } catch (error) {
      console.error('Failed to initialize model:', error);
      throw new Error('Model initialization failed');
    }
  }

  private buildModel(): tf.LayersModel {
    const model = tf.sequential();
    
    model.add(tf.layers.conv2d({
      inputShape: [96, 96, 3],
      filters: 16,
      kernelSize: 3,
      activation: 'relu',
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    model.add(tf.layers.conv2d({
      filters: 32,
      kernelSize: 3,
      activation: 'relu',
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(tf.layers.dense({ 
      units: this.CONDITIONS.length, 
      activation: 'sigmoid' 
    }));

    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  async preprocessImage(imageElement: HTMLImageElement | null): Promise<tf.Tensor4D> {
    if (!imageElement) {
      throw new Error('Invalid image input');
    }

    if (!(imageElement instanceof HTMLImageElement)) {
      throw new Error('Input must be an HTMLImageElement');
    }

    if (!imageElement.complete || !imageElement.naturalHeight) {
      throw new Error('Image not fully loaded');
    }

    return tf.tidy(() => {
      try {
        const tensor = tf.browser.fromPixels(imageElement)
          .resizeBilinear([96, 96])
          .toFloat()
          .div(255.0)
          .expandDims(0);
        return tensor as tf.Tensor4D;
      } catch (error) {
        throw new Error('Failed to process image: ' + error.message);
      }
    });
  }

  async train(images: tf.Tensor4D, labels: tf.Tensor2D, epochs: number = 10) {
    if (!this.isModelReady) {
      throw new Error('Model not initialized');
    }

    if (!images || !labels) {
      throw new Error('Training data missing');
    }

    try {
      const result = await this.model.fit(images, labels, {
        epochs,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch}: loss = ${logs?.loss?.toFixed(4) || 'N/A'}`);
          },
        },
      });
      return result;
    } catch (error) {
      throw new Error('Training failed: ' + error.message);
    } finally {
      tf.dispose([images, labels]);
    }
  }

  private calculateSeverity(probability: number): Severity {
    if (probability >= 0.7) return 'high';
    if (probability >= 0.3) return 'moderate';
    return 'low';
  }

  async predict(imageElement: HTMLImageElement): Promise<FacialCondition[]> {
    if (!this.isModelReady) {
      throw new Error('Model not initialized');
    }

    let tensor: tf.Tensor4D | null = null;
    let prediction: tf.Tensor | null = null;

    try {
      tensor = await this.preprocessImage(imageElement);
      prediction = await this.model.predict(tensor) as tf.Tensor;
      const probabilities = Array.from(await prediction.data());
      
      if (probabilities.length !== this.CONDITIONS.length) {
        throw new Error('Prediction output size mismatch');
      }

      return this.CONDITIONS.map((condition, index): FacialCondition => {
        const probability = Math.max(0, Math.min(1, probabilities[index])); // Clamp between 0 and 1
        return {
          type: condition,
          confidence: parseFloat(probability.toFixed(4)),
          severity: this.calculateSeverity(probability),
          affectedAreas: ['face'],
          relatedDoshas: this.getRelatedDoshas(condition)
        };
      });
    } catch (error) {
      throw new Error('Prediction failed: ' + error.message);
    } finally {
      if (tensor) tf.dispose(tensor);
      if (prediction) tf.dispose(prediction);
    }
  }

  private getRelatedDoshas(condition: string): string[] {
    const doshaMap: Record<string, string[]> = {
      'acne': ['pitta'],
      'dark_spots': ['pitta', 'vata'],
      'wrinkles': ['vata'],
      'dryness': ['vata'],
      'oily': ['kapha']
    };
    return doshaMap[condition] || [];
  }
}
