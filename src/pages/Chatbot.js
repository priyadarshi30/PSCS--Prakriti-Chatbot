import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Chatbot.css';
import { ImageInput } from '../components/ImageInput';
import HealthAnalysisService from '../services/HealthAnalysisService';

const QuickAccessTopics = [
  "Common Health Issues",
  "Dietary Guidelines",
  "Herbal Remedies",
  "Daily Routines",
  "Mental Wellness",
  "Seasonal Care",
  "Body Constitution",
  "Prevention Tips"
];

const TopicResponses = {
  "Common Health Issues": [
    "Common Ayurvedic Health Issues and Remedies:",
    "",
    "1. Digestive Issues (Agnimandya):",
    "   • Symptoms: Poor digestion, bloating, gas",
    "   • Remedies: Ginger tea, cumin water, proper food combinations",
    "   • Prevention: Regular eating schedule, mindful eating",
    "",
    "2. Respiratory Problems (Pranavaha Sroto Vikara):",
    "   • Symptoms: Cough, cold, allergies",
    "   • Remedies: Tulsi tea, honey with black pepper, steam inhalation",
    "   • Prevention: Pranayama, proper sleep schedule",
    "",
    "3. Stress and Anxiety (Chittakshobha):",
    "   • Symptoms: Restlessness, insomnia, worry",
    "   • Remedies: Brahmi, Ashwagandha, meditation",
    "   • Prevention: Regular exercise, proper daily routine",
    "",
    "4. Joint Pain (Sandhigata Vata):",
    "   • Symptoms: Stiffness, pain, reduced mobility",
    "   • Remedies: Warm oil massage, ginger compress",
    "   • Prevention: Proper exercise, joint-friendly yoga",
    "",
    "Would you like specific details about any of these conditions?"
  ].join("\n"),

  "Dietary Guidelines": [
    "According to Ayurveda, here are the key dietary guidelines:",
    "1. Eat according to your dosha (body constitution):",
    "   - Vata: Warm, cooked, easily digestible foods",
    "   - Pitta: Cool, fresh foods, avoiding spicy and fermented",
    "   - Kapha: Light, warm, and spicy foods",
    "2. General principles:",
    "   - Eat only when hungry",
    "   - Consume fresh, seasonal foods",
    "   - Avoid incompatible food combinations",
    "   - Include all six tastes in daily diet (sweet, sour, salty, pungent, bitter, astringent)",
    "3. Eating habits:",
    "   - Eat in a calm environment",
    "   - Avoid eating late at night",
    "   - Practice mindful eating",
    "Would you like to know more about any specific aspect?"
  ].join("\n"),

  "Herbal Remedies": [
    "Essential Ayurvedic herbs and their benefits:",
    "1. Turmeric (Haldi):",
    "   - Anti-inflammatory and antioxidant properties",
    "   - Helps in wound healing and immunity",
    "2. Ashwagandha:",
    "   - Reduces stress and anxiety",
    "   - Improves strength and stamina",
    "3. Triphala:",
    "   - Supports digestive health",
    "   - Cleanses and detoxifies the body",
    "4. Holy Basil (Tulsi):",
    "   - Boosts immunity",
    "   - Relieves respiratory issues",
    "Would you like to know more about any specific herb?"
  ].join("\n"),

  "Daily Routines": [
    "Ayurvedic Daily Routine (Dinacharya):",
    "1. Morning Routine:",
    "   - Wake up before sunrise",
    "   - Practice oral hygiene (tongue cleaning, oil pulling)",
    "   - Meditate and exercise",
    "2. Afternoon Routine:",
    "   - Main meal during peak digestion (12-1 PM)",
    "   - Short walk after meals",
    "   - Stay hydrated",
    "3. Evening Routine:",
    "   - Light dinner before sunset",
    "   - Gentle walking",
    "   - Early bedtime",
    "Would you like more details about any specific routine?"
  ].join("\n"),

  "Mental Wellness": [
    "Ayurvedic Approach to Mental Wellness:",
    "1. Balance of Doshas:",
    "   - Vata: Meditation, routine, grounding practices",
    "   - Pitta: Cooling activities, nature walks",
    "   - Kapha: Active lifestyle, stimulating activities",
    "2. Recommended Practices:",
    "   - Meditation and pranayama",
    "   - Yoga asanas",
    "   - Regular exercise",
    "3. Herbal Support:",
    "   - Brahmi: Mental clarity",
    "   - Shankhpushpi: Memory enhancement",
    "   - Jatamansi: Natural stress relief",
    "Would you like to explore any specific aspect?"
  ].join("\n"),

  "Seasonal Care": [
    "Seasonal Health Guidelines (Ritucharya):",
    "1. Spring (Vasant):",
    "   - Light, warm foods",
    "   - Detoxification",
    "   - Regular exercise",
    "2. Summer (Grishma):",
    "   - Cool, sweet foods",
    "   - Stay hydrated",
    "   - Moderate exercise",
    "3. Monsoon (Varsha):",
    "   - Avoid raw foods",
    "   - Boost immunity",
    "   - Light yoga",
    "4. Winter (Hemant):",
    "   - Warm, nourishing foods",
    "   - Oil massage",
    "   - Regular exercise",
    "Would you like details for a specific season?"
  ].join("\n"),

  "Body Constitution": [
    "Understanding Your Body Type (Prakriti):",
    "1. Vata Type:",
    "   - Characteristics: Light, quick, creative",
    "   - Diet: Warm, nourishing foods",
    "   - Lifestyle: Regular routine",
    "2. Pitta Type:",
    "   - Characteristics: Sharp, focused, intense",
    "   - Diet: Cooling, moderate foods",
    "   - Lifestyle: Relaxation practices",
    "3. Kapha Type:",
    "   - Characteristics: Strong, calm, stable",
    "   - Diet: Light, spicy foods",
    "   - Lifestyle: Regular exercise",
    "Would you like to determine your body type?"
  ].join("\n"),

  "Prevention Tips": [
    "Ayurvedic Disease Prevention Guidelines:",
    "1. Daily Practices:",
    "   - Regular exercise (Vyayama)",
    "   - Meditation and yoga",
    "   - Proper sleep schedule",
    "2. Dietary Habits:",
    "   - Eat according to constitution",
    "   - Proper food combinations",
    "   - Mindful eating",
    "3. Seasonal Adjustments:",
    "   - Adapt routine to seasons",
    "   - Appropriate clothing",
    "   - Seasonal foods",
    "4. Mental Health:",
    "   - Stress management",
    "   - Regular meditation",
    "   - Positive relationships",
    "Would you like specific prevention tips?"
  ].join("\n")
};

const SUPPORTED_LANGUAGES = {
  en: { code: 'en-US', name: 'English' },
  hi: { code: 'hi-IN', name: 'Hindi' },
  kn: { code: 'kn-IN', name: 'Kannada' },
  te: { code: 'te-IN', name: 'Telugu' },
  ta: { code: 'ta-IN', name: 'Tamil' },
  mr: { code: 'mr-IN', name: 'Marathi' }
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const formatDateTime = () => {
  return new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatSessionDuration = (startTime) => {
  const now = new Date();
  const diff = now - new Date(startTime);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${minutes} min`;
  }
  return `${hours}h ${remainingMinutes}m`;
};

const dailyHealthTips = [
  "Drink warm water with lemon first thing in the morning",
  "Practice oil pulling for 10-15 minutes daily",
  "Include turmeric in your daily diet",
  "Perform pranayama for 10 minutes",
  "Take a short walk after meals",
  "Follow the principle of 'early to bed, early to rise'",
  "Practice mindful eating",
  "Stay hydrated with copper-stored water",
  "Include seasonal fruits in your diet",
  "Massage your feet with oil before sleeping"
];

// Added missing functions
const generateAssessmentQuestions = (prompt) => {
  // This is a placeholder implementation - replace with actual logic
  return {
    questions: [
      "Could you describe your symptoms in more detail?",
      "How long have you been experiencing these symptoms?",
      "Have you tried any remedies so far?",
      "Do these symptoms get worse at any particular time of day?"
    ],
    userResponses: []
  };
};

const askNextQuestion = (index, assessment) => {
  // This is a placeholder implementation - replace with actual logic
  if (index < assessment.questions.length) {
    return assessment.questions[index];
  }
  return "Thank you for providing all that information. Based on your symptoms...";
};

// Add utility functions at the top level
const formatAnalysisText = (content) => {
  if (!content) return '';

  return content
    // Format markdown headers and strong text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert newlines to <br> tags
    .replace(/\n/g, '<br />')
    // Format bullet points into list items
    .replace(/• (.*?)(\n|$)/g, '<li>$1</li>')
    // Wrap consecutive list items in <ul> tags
    .replace(/(<li>.*?<\/li>(\n|$))+/g, '<ul>$&</ul>')
    // Add special formatting for Sanskrit terms
    .replace(/\(([\u0900-\u097F\s]+)\)/g, '<span class="sanskrit">$1</span>')
    // Format percentages
    .replace(/(\d+)%/g, '<span class="percentage">$1%</span>');
};

const Chatbot = () => {
  const navigate = useNavigate();
  
  // Initial auth check
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userEmail = localStorage.getItem('userEmail');
    const token = localStorage.getItem('token');
    
    if (!isAuthenticated || !userEmail || !token) {
      // Clean up any stale auth data
      localStorage.clear();
      navigate('/login', { replace: true });
      return;
    }

    // Listen for auth changes
    const handleAuthChange = () => {
      const authState = localStorage.getItem('isAuthenticated') === 'true';
      const email = localStorage.getItem('userEmail');
      const authToken = localStorage.getItem('token');
      
      if (!authState || !email || !authToken) {
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [navigate]);

  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [userInfo, setUserInfo] = useState({
    name: 'Loading...',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    const savedMute = localStorage.getItem('chatMuted');
    return savedMute ? JSON.parse(savedMute) : false;
  });
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [languageMap] = useState({
    'en': 'en-US',
    'hi': 'hi-IN',
    'kn': 'kn-IN',
    'te': 'te-IN',
    'ta': 'ta-IN',
    'ml': 'ml-IN'
  });
  const [assessment, setAssessment] = useState(null);
  const [isAssessmentMode, setIsAssessmentMode] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);  const [analyzer] = useState(() => {
    return {
      analyze: async (image) => {
        try {
          console.log('Starting image analysis...');
          const analysis = await HealthAnalysisService.analyzeImage(image);
          console.log('Analysis results:', analysis);
          
          if (!analysis || (!analysis.facialAnalysis && !analysis.healthIndications)) {
            throw new Error('Analysis failed to produce valid results');
          }

          // Create a standardized analysis result
          return {
            emotionalState: analysis.facialAnalysis?.emotion?.dominant || 'neutral',
            emotionalConfidence: analysis.facialAnalysis?.emotion?.confidence || 0,
            healthIndications: analysis.healthIndications || [],
            ayurvedicSuggestions: analysis.ayurvedicSuggestions || [],
            physicalFeatures: analysis.facialAnalysis?.physicalFeatures || [],
            doshaAnalysis: {
              vata: analysis.facialAnalysis?.doshaIndication?.scores?.vata || 33,
              pitta: analysis.facialAnalysis?.doshaIndication?.scores?.pitta || 33,
              kapha: analysis.facialAnalysis?.doshaIndication?.scores?.kapha || 34
            },
            seasonalInfluence: analysis.facialAnalysis?.seasonalIndication || null,
            wellnessScore: analysis.facialAnalysis?.wellnessScore || 0
          };
        } catch (error) {
          console.error('Health analysis error:', error);
          throw error;
        }
      }
    };
  });
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [dailyTip] = useState(() => 
    dailyHealthTips[Math.floor(Math.random() * dailyHealthTips.length)]
  );
  const [sessionStartTime] = useState(new Date());
  const [lastActive, setLastActive] = useState('Just now');
  const [modelLoadProgress, setModelLoadProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = now - new Date(sessionStartTime);
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) {
        setLastActive('Just now');
      } else if (minutes < 60) {
        setLastActive(`${minutes} minutes ago`);
      } else {
        setLastActive(`${Math.floor(minutes / 60)} hours ago`);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  useEffect(() => {
    // Add model load progress listener
    const removeListener = HealthAnalysisService.addLoadProgressListener((progress) => {
      setModelLoadProgress(progress);
    });

    return () => removeListener();
  }, []);

  const speakResponse = useCallback(async (text) => {
    if (!window.speechSynthesis || isMuted) return;
    
    try {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageMap[selectedLanguage];
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  }, [isMuted, languageMap, selectedLanguage]);  const generateAIResponse = useCallback(async (prompt) => {
    // Format message content by adding proper line breaks
    const formatMessageContent = (content) => {
      if (!content) return "I apologize, but I'm having trouble understanding. Could you please rephrase?";
      return content.replace(/•/g, '\n•').replace(/:/g, ':\n');
    };

    try {
      // Check for greetings first
      const greetings = ['hello', 'hi', 'hey', 'namaste', 'greetings', 'good morning', 'good afternoon', 'good evening'];
      if (greetings.some(greeting => prompt.toLowerCase().includes(greeting))) {
        return `${getGreeting()}! I'm your Ayurvedic Health Assistant. How can I help you today? You can:
• Ask me about health concerns
• Get dietary recommendations
• Learn about Ayurvedic remedies
• Get personalized health advice
• Upload an image for health analysis`;
      }

      // Check for quick access topics
      if (TopicResponses[prompt]) {
        return formatMessageContent(TopicResponses[prompt]);
      }

      // Check if it's a health concern
      const healthKeywords = [
        'pain', 'ache', 'hurt', 'hurts', 'sore', 'suffering',
        'having', 'feeling', 'experiencing', 'problem', 'issue'
      ];
      
      const isHealthConcern = healthKeywords.some(keyword => 
        prompt.toLowerCase().includes(keyword));

      if (isHealthConcern) {
        setIsAssessmentMode(true);
        const healthAssessment = generateAssessmentQuestions(prompt);
        setAssessment(healthAssessment);
        
        const firstQuestion = askNextQuestion(0, healthAssessment);
        setMessages(prev => [...prev, {
          type: 'bot',
          content: formatMessageContent(firstQuestion),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          id: Date.now()
        }]);
        
        return null;
      }

      // Send to backend chatbot API
      try {
        const response = await axios.post('http://localhost:5000/chatbot', {
          question: prompt,
          email: userInfo.email
        });

        if (response.data?.response) {
          return formatMessageContent(response.data.response);
        }
        
        throw new Error('Invalid response from server');
      } catch (error) {
        console.error('Server response error:', error);
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
        return "I apologize, but I'm having trouble connecting to the server. Let me help you with some general Ayurvedic guidance instead. You can ask me about:\n• Common Health Issues\n• Dietary Guidelines\n• Herbal Remedies\n• Daily Routines\n• Mental Wellness";
      }
    } catch (error) {
      console.error('AI Response Error:', error);
      throw error;
    }
  }, [selectedLanguage, userInfo.email]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const inputValue = currentInput.trim();
    if (!inputValue || loading) return;

    setLoading(true);
    const tempInput = inputValue;
    setCurrentInput('');

    try {
      const userMessageId = Date.now();
      setMessages(prev => [...prev, {
        type: 'user',
        content: tempInput,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: userMessageId
      }]);

      const response = await generateAIResponse(tempInput);
      
      if (response !== null) {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          id: Date.now()
        }]);

        if (!isMuted) {
          await speakResponse(response);
        }
      }
    } catch (error) {
      console.error('Submit Error:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: "I apologize, but I'm having trouble responding. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        id: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  }, [currentInput, loading, isMuted, generateAIResponse, speakResponse]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = languageMap[selectedLanguage] || 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setCurrentInput('');
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setCurrentInput(transcript);
        
        if (event.results[0].isFinal) {
          setTimeout(() => {
            handleSubmit({
              preventDefault: () => {},
              currentTarget: { value: transcript }
            });
          }, 500);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = 'Speech recognition error. ';
        switch (event.error) {
          case 'not-allowed':
            errorMessage += 'Please enable microphone access.';
            break;
          case 'no-speech':
            errorMessage += 'No speech was detected. Please try again.';
            break;
          case 'network':
            errorMessage += 'Please check your internet connection.';
            break;
          default:
            errorMessage += 'Please try again.';
        }
        
        setMessages(prev => [...prev, {
          type: 'bot',
          content: errorMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
          id: Date.now()
        }]);
      };

      setRecognition(recognition);

      return () => {
        if (recognition) {
          recognition.abort();
        }
      };
    }
  }, [selectedLanguage, handleSubmit]);

  const handleVoiceInput = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      try {
        setCurrentInput('');
        recognition.lang = languageMap[selectedLanguage] || 'en-US';
        recognition.start();
      } catch (error) {
        console.error('Speech recognition error:', error);
        setIsListening(false);
        setMessages(prev => [...prev, {
          type: 'bot',
          content: 'Failed to start voice input. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
          id: Date.now()
        }]);
      }
    }
  };

  useEffect(() => {
    localStorage.setItem('chatMuted', JSON.stringify(isMuted));
  }, [isMuted]);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email = localStorage.getItem('userEmail');
        const isAuth = localStorage.getItem('isAuthenticated') === 'true';
        const token = localStorage.getItem('token');
        
        if (!email || !isAuth || !token) {
          localStorage.clear();
          navigate('/login', { replace: true });
          return;
        }

        // Try to get cached user data first
        const cachedData = localStorage.getItem('userData');
        if (cachedData) {
          const userData = JSON.parse(cachedData);
          setUserInfo({
            name: userData.name,
            email: userData.email
          });
          return;
        }

        // If no cached data, fetch from server
        const response = await axios.get(`http://localhost:5000/api/users/${email}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data && response.data.user) {
          const userData = {
            name: response.data.user.full_name,
            email: email
          };
          setUserInfo(userData);
          localStorage.setItem('userData', JSON.stringify(userData));
        } else {
          throw new Error('User data not found');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        localStorage.clear();
        navigate('/login', { replace: true });
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    setMessages([{
      type: 'bot',
      content: `${getGreeting()}! How can I assist you with your health today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: Date.now()
    }]);
  }, []);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  };

  const handleQuickAccessClick = async (topic) => {
    const userMessage = {
      type: 'user',
      content: topic,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = TopicResponses[topic];
      if (!response) {
        throw new Error('Topic response not found');
      }

      setMessages(prev => [...prev, {
        type: 'bot',
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: Date.now()
      }]);

      if (!isMuted) {
        await speakResponse(response);
      }
    } catch (error) {
      console.error('Quick access error:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: "I apologize, but I'm having trouble accessing that information. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: Date.now()
      }]);
    }
  };

  const handleExportChat = () => {
    const chatText = messages.map(msg =>
      `${msg.timestamp} - ${msg.type === 'user' ? 'You' : 'Bot'}: ${msg.content}`
    ).join('\n');

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'chat_history.txt';
    link.click();

    URL.revokeObjectURL(url);
  };  const handleCameraClick = () => {
    if (showCamera) {
      setShowCamera(false);
    } else {
      setShowCamera(true);
      setShowImageInput(false);
    }
  };

  const handleUploadClick = () => {
    if (showImageInput) {
      setShowImageInput(false);
    } else {
      setShowImageInput(true);
      setShowCamera(false);
    }
  };  const handleImageSelect = async (image) => {
    try {
      setSelectedImage(image);
      setShowImageInput(false);
      setShowCamera(false);
      setLoading(true);

      // Show initial processing message
      setMessages(prev => [...prev, {
        type: 'user',
        content: '🔍 Processing image for detailed Ayurvedic analysis...',
        timestamp: new Date().toLocaleTimeString(),
        id: Date.now(),
        hasImage: true,
        imageUrl: image.src
      }]);

      // Start analysis
      const analysis = await analyzer.analyze(image);

      // Format analysis results with better structure and error handling
      const formatSection = (title, items) => {
        if (!items || items.length === 0) return '';
        return `**${title}**\n${items.map(item => `• ${item}`).join('\n')}\n\n`;
      };      // Pre-process dosha analysis for use in both message and speech
      let doshas = [];
      let dominantDosha = '';
      if (analysis.doshaAnalysis) {
        doshas = Object.entries(analysis.doshaAnalysis);
        dominantDosha = doshas.reduce((a, b) => a[1] > b[1] ? a : b)[0];
      }

      let analysisMessage = '🌿 **Ayurvedic Analysis Results**\n\n';

      // Health Observations with Sanskrit terms
      if (analysis.healthIndications && analysis.healthIndications.length > 0) {
        analysisMessage += formatSection('Health Observations (स्वास्थ्य परीक्षण)', 
          analysis.healthIndications);
      }

      // Emotional State with confidence
      if (analysis.emotionalState) {
        const confidence = analysis.emotionalConfidence || 85;
        analysisMessage += `**Emotional Balance (भाव स्थिति)**\n• Current state: ${analysis.emotionalState} (${confidence}% confidence)\n\n`;
      }

      // Physical Features with detailed observations
      if (analysis.physicalFeatures && analysis.physicalFeatures.length > 0) {
        analysisMessage += formatSection('Physical Characteristics (शारीरिक लक्षण)', 
          analysis.physicalFeatures);
      }

      // Dosha Analysis with percentages and recommendations
      if (doshas.length > 0) {
        analysisMessage += '**Dosha Balance (दोष विश्लेषण)**\n';
        doshas.forEach(([dosha, percentage]) => {
          analysisMessage += `• ${dosha}: ${percentage}%${dosha === dominantDosha ? ' (Dominant)' : ''}\n`;
        });
        analysisMessage += '\n';
      }

      // Ayurvedic Recommendations with seasonal context
      analysisMessage += formatSection('Ayurvedic Recommendations (आयुर्वेदिक उपचार)', 
        analysis.ayurvedicSuggestions || []);

      // Seasonal Influence with practical tips
      if (analysis.seasonalInfluence) {
        analysisMessage += `**Seasonal Considerations (ऋतु विचार)**\n• ${analysis.seasonalInfluence}\n\n`;
      }

      // Add analysis results to chat with proper formatting
      setMessages(prev => [...prev, {
        type: 'bot',
        content: analysisMessage,
        timestamp: new Date().toLocaleTimeString(),
        id: Date.now(),
        hasImage: true,
        imageUrl: image.src,
        analysis: analysis,
        format: 'markdown'
      }]);

      // Speak a concise summary if voice is enabled
      if (!isMuted) {
        const summary = `Based on the Ayurvedic analysis, your dominant dosha is ${
          doshas.reduce((a, b) => a[1] > b[1] ? a : b)[0]
        }. Would you like me to explain the recommendations in detail?`;
        await speakResponse(summary);
      }

    } catch (error) {
      console.error('Image analysis error:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: "I apologize, but I encountered an error while analyzing the image. Please ensure the image is clear and well-lit, then try again.",
        timestamp: new Date().toLocaleTimeString(),
        id: Date.now(),
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderAnalysisResults = (analysis) => {
    if (!analysis) return null;
  
    return (
      <div className="analysis-details">
        {analysis.wellnessScore && (
          <div className="wellness-score">
            <h4>📊 Overall Wellness Score</h4>
            <p>{analysis.wellnessScore}/100</p>
          </div>
        )}
        
        {analysis.emotion && analysis.emotion.dominant && (
          <div className="emotional-state">
            <h4>😊 Emotional State</h4>
            <p>Primary: {analysis.emotion.dominant} ({Math.round(analysis.emotion.confidence)}% confidence)</p>
            {analysis.emotion.breakdown && analysis.emotion.breakdown.length > 0 && (
              <ul>
                {analysis.emotion.breakdown.map((e, idx) => (
                  <li key={idx}>{e.emotion}: {e.level}%</li>
                ))}
              </ul>
            )}
          </div>
        )}
        
        {analysis.physicalFeatures && (
          <div className="physical-analysis">
            <h4>👁️ Physical Observations</h4>
            <ul>
              {analysis.physicalFeatures.eyeStrain && (
                <li>Eye Strain: {analysis.physicalFeatures.eyeStrain.indication} 
                  ({analysis.physicalFeatures.eyeStrain.level}%)</li>
              )}
              {analysis.physicalFeatures.facialSymmetry && (
                <li>Facial Symmetry: {analysis.physicalFeatures.facialSymmetry.quality} 
                  ({analysis.physicalFeatures.facialSymmetry.score}%)</li>
              )}
              {analysis.physicalFeatures.undereyePuffiness && (
                <li>Under-eye Puffiness: {analysis.physicalFeatures.undereyePuffiness.severity}</li>
              )}
              {analysis.physicalFeatures.jawlineDefinition && (
                <li>Jawline Definition: {analysis.physicalFeatures.jawlineDefinition.type}</li>
              )}
              {analysis.physicalFeatures.faceShape && (
                <li>Face Shape: {analysis.physicalFeatures.faceShape.type}</li>
              )}
            </ul>
          </div>
        )}
  
        {analysis.doshaIndication && (
          <div className="dosha-analysis">
            <h4>🎯 Dosha Analysis</h4>
            <p>Primary Dosha: {analysis.doshaIndication.primaryDosha.toUpperCase()}</p>
            {analysis.doshaIndication.recommendations && (
              <div className="recommendations">
                <h4>📝 Recommended Actions</h4>
                <ul>
                  {analysis.doshaIndication.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const LanguageSelector = () => (
    <select 
      value={selectedLanguage}
      onChange={(e) => setSelectedLanguage(e.target.value)}
      className="language-selector"
    >
      <option value="en">English</option>
      <option value="hi">हिंदी (Hindi)</option>
      <option value="kn">ಕನ್ನಡ (Kannada)</option>
      <option value="te">తెలుగు (Telugu)</option>
      <option value="ta">தமிழ் (Tamil)</option>
      <option value="ml">മലയാളം (Malayalam)</option>
    </select>
  );

  return (
    <div className="chatbot-main">
      <div className="chatbot-sidebar">
        <div className="sidebar-header">
          <button className="new-chat-btn">+ New Chat</button>
          <button className="clear-chat-btn" onClick={() => setMessages([])}>🗑 Clear Chat</button>
        </div>

        <div className="sidebar-box quick-access">
          <div className="box-header">
            <span className="box-icon">⚡</span>
            <h3>Quick Access</h3>
          </div>
          <div className="box-content">
            <div className="quick-access-items">
              {QuickAccessTopics.map((topic, index) => (
                <button
                  key={index}
                  className="quick-access-item"
                  onClick={() => handleQuickAccessClick(topic)}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-header">
          <h1>Ayurvedic Health Assistant Chatbot</h1>          <div className="header-controls">
            <div className="media-controls">
              <button className="media-button" onClick={handleCameraClick}>
                📷 Camera
              </button>
              <button className="media-button" onClick={handleUploadClick}>
                🖼️ Upload Image
              </button>
            </div>
            <LanguageSelector />
            <button className="export-chat" onClick={handleExportChat}>Export Chat</button>
          </div>
        </div>

        <div className="chat-messages" id="chat-messages">          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`message ${msg.type} ${msg.isError ? 'error' : ''} ${msg.format === 'markdown' ? 'markdown' : ''}`}
            >
              {msg.hasImage && (
                <>
                  <img src={msg.imageUrl} alt="Analysis" className="message-image" />
                  <div className="analysis-result">
                    <div 
                      className="message-content"
                      dangerouslySetInnerHTML={{
                        __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                           .replace(/\n/g, '<br />')
                                           .replace(/• (.*?)(\n|$)/g, '<li>$1</li>')
                                           .replace(/(<li>.*?<\/li>(\n|$))+/g, '<ul>$&</ul>')
                      }}
                    />
                    {msg.analysis && (
                      <div className="dosha-percentages">
                        {msg.analysis.doshaAnalysis && Object.entries(msg.analysis.doshaAnalysis).map(([dosha, percentage]) => (
                          <div key={dosha} className="dosha-percentage">
                            <strong>{dosha}</strong>
                            <div>{percentage}%</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
              {!msg.hasImage && (
                <div 
                  className="message-content"
                  dangerouslySetInnerHTML={{
                    __html: msg.format === 'markdown' 
                      ? msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                 .replace(/\n/g, '<br />')
                                 .replace(/• (.*?)(\n|$)/g, '<li>$1</li>')
                                 .replace(/(<li>.*?<\/li>(\n|$))+/g, '<ul>$&</ul>')
                      : msg.content
                  }}
                />
              )}
              <div className="message-timestamp">{msg.timestamp}</div>
            </div>
          ))}
          {loading && (
            <div className="message bot loading">
              <div className="message-content">Thinking...</div>
            </div>
          )}
        </div>

        {(showCamera || showImageInput) && (
          <div className="image-input-overlay">
            <div className="image-input-modal">
              <div className="image-input-header">
                <h3>{showCamera ? 'Take a Photo' : 'Upload an Image'}</h3>
                <button className="close-button" onClick={() => {
                  setShowCamera(false);
                  setShowImageInput(false);
                }}>×</button>
              </div>
              <ImageInput
                onImageSelect={handleImageSelect}
                initialMode={showCamera ? 'camera' : 'upload'}
                maxSize={10}
                allowedTypes={['image/jpeg', 'image/png']}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="chat-input-area">
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="Ask a question about your health..."
            className="chat-input"
          />
          <div className="input-buttons">
            <button type="button" className="mic-button" onClick={handleVoiceInput}>
              {isListening ? '🔴' : '🎤'}
            </button>
            <button type="button" className="sound-button" onClick={toggleMute}>
              {isMuted ? '🔇' : '🔊'}
            </button>
            <button type="submit" className="send-button">➤</button>
          </div>
        </form>
      </div>

      <div className="user-profile">
        <div className="profile-header">
          <div className="profile-info-container">
            <div className="profile-avatar">👤</div>
            <div className="profile-info">
              <h3>{userInfo.name}</h3>
              <p>{userInfo.email}</p>
            </div>
          </div>          <button onClick={() => {
            // Clear all auth data
            localStorage.removeItem('userEmail');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            
            // Force auth state update
            window.dispatchEvent(new Event('storage'));
            
            // Navigate to login with replace to prevent back navigation
            navigate('/login', { replace: true });
          }} className="logout-button">
            Logout
          </button>
        </div>

        <div className="profile-stats">
          <div className="stat">Questions Asked: {messages.filter(m => m.type === 'user').length}</div>
          <div className="stat">Session Duration: {formatSessionDuration(sessionStartTime)}</div>
          <div className="stat">Last Active: {lastActive}</div>
        </div>

        <div className="health-tips-area">
          <h4>Today's Ayurvedic Tip</h4>
          <div className="daily-tip">
            <span className="tip-icon">💡</span>
            <p>{dailyTip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;