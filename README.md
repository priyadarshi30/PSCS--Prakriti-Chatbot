# AyurBot - Ayurvedic Health Assistant

An AI-powered chatbot that provides Ayurvedic health guidance and personalized assessments.

## Features

- Multi-language support (English, Hindi, Kannada, Telugu, Tamil, Malayalam)
- Prakriti (body constitution) assessment
- Dynamic health assessments
- Voice input and text-to-speech
- Facial expression analysis
- Chat export functionality
- Quick access to common health topics

## Prerequisites

- Node.js (v14 or higher)
- Python (3.8 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ayurbot.git
cd ayurbot
```

2. Install frontend dependencies:
```bash
npm install
# or
yarn install
```

3. Install backend dependencies:
```bash
cd backend
python -m venv venv
# On Windows
venv\Scripts\activate
# On Unix or MacOS
source venv/bin/activate
pip install -r requirements.txt
```

4. Set up environment variables:
Create a `.env` file in the backend directory:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

5. Set up MongoDB:
- Install MongoDB locally or use MongoDB Atlas
- Create a database named 'ayurbot'
- Create collections: 'users', 'chats'

## Running the Application

1. Start the backend server:
```bash
cd backend
# Activate virtual environment if not already activated
python app.py
```

2. Start the frontend development server:
```bash
# In a new terminal, from the project root
npm start
# or
yarn start
```

3. Access the application:
Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
ayurbot/
├── src/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   └── App.js
├── backend/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── app.py
├── public/
└── package.json
```

## Usage

1. Register/Login to access the chatbot
2. Select your preferred language
3. Use the chat interface to:
   - Ask health-related questions
   - Take the Prakriti assessment
   - Get personalized health advice
   - Use voice input/output features
   - Access quick health topics

## Features in Detail

### Prakriti Assessment
- Complete questionnaire to determine your body constitution
- Receive personalized health recommendations

### Dynamic Health Assessment
- AI-powered symptom analysis
- Customized questions based on health concerns
- Ayurvedic treatment suggestions

### Multi-language Support
- Switch between multiple Indian languages
- Voice input/output in selected language

### Image Analysis
- Facial expression analysis for health indicators
- Personalized recommendations based on analysis

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
