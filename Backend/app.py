# -----------------------📦 Imports -----------------------
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_mail import Mail, Message

from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import mysql.connector
import bcrypt
import os
import groq
import speech_recognition as sr
from gtts import gTTS
import random
import string

# ----------------------⚙️ Environment Setup ----------------------
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
DB_PASSWORD = os.getenv("DB_PASSWORD")

if not GROQ_API_KEY:
    raise ValueError("🚨 Missing GROQ_API_KEY! Please set it in your .env file.")
if not MAIL_USERNAME or not MAIL_PASSWORD:
    raise ValueError("🚨 Missing MAIL credentials! Set MAIL_USERNAME and MAIL_PASSWORD.")
if not DB_PASSWORD:
    raise ValueError("🚨 Missing DB_PASSWORD! Set it in your .env file.")

# ----------------------🚀 Flask App Setup ----------------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type"]}})

from flask import send_from_directory

# Define the absolute path to the weights directory
WEIGHTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public', 'weights')

# Print configuration for debugging
print(f"Server starting with weights directory: {WEIGHTS_DIR}")
if os.path.exists(WEIGHTS_DIR):
    print("Available model files:", os.listdir(WEIGHTS_DIR))
else:
    print("WARNING: Weights directory does not exist!")

# Serve model files from the weights directory
@app.route('/weights/<path:filename>', methods=['GET', 'OPTIONS'])
def serve_model_file(filename):
    print(f"Received request for model file: {filename}")
    
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers.update({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        })
        return response
    
    try:
        file_path = os.path.join(WEIGHTS_DIR, filename)
        print(f"Attempting to serve file from: {file_path}")
        
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            return jsonify({
                'error': 'Model file not found',
                'path': file_path
            }), 404
        
        response = send_file(
            file_path,
            as_attachment=False,
            mimetype='application/octet-stream' if not filename.endswith('.json') else 'application/json'
        )
        
        # Set CORS and caching headers
        response.headers.update({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'public, max-age=3600'
        })
        
        print(f"Successfully serving file: {filename}")
        return response
        
    except Exception as e:
        print(f"Error serving model file {filename}: {str(e)}")
        return jsonify({
            'error': str(e),
            'file': filename
        }), 500

# Print configuration for debugging
print(f"Root path: {app.root_path}")
print(f"Weights directory: {WEIGHTS_DIR}")
if os.path.exists(WEIGHTS_DIR):
    print("Files in weights directory:", os.listdir(WEIGHTS_DIR))

# Debug endpoint to check file paths
@app.route('/debug/file-check')
def debug_file_check():
    base_path = app.static_folder
    weights_path = os.path.join(base_path, 'weights')
    test_file = os.path.join(weights_path, 'tiny_face_detector_model-weights_manifest.json')
    
    return jsonify({
        'static_folder': app.static_folder,
        'static_url_path': app.static_url_path,
        'weights_path_exists': os.path.exists(weights_path),
        'test_file_exists': os.path.exists(test_file),
        'files_in_weights': os.listdir(weights_path) if os.path.exists(weights_path) else [],
        'full_test_path': test_file
    })

# Update CORS configuration
CORS(app,
     resources={
         r"/*": {
             "origins": ["http://localhost:3000", "http://localhost:5000"],
             "methods": ["GET", "POST", "OPTIONS"],
             "allow_headers": ["*"],
             "expose_headers": ["Content-Type", "X-Model-Status"],
             "supports_credentials": True,
             "send_wildcard": True
         }
     }
)

# ----------------------🛢️ MySQL Setup ----------------------
try:
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password=DB_PASSWORD,
        database="ayurbot_db"    # Changed database name
    )
    cursor = db.cursor(dictionary=True)
except mysql.connector.Error as err:
    print("❌ Database connection error:", err)
    exit(1)

# ----------------------📧 Email Setup ----------------------
app.config.update({
    "MAIL_SERVER": "smtp.gmail.com",
    "MAIL_PORT": 587,
    "MAIL_USE_TLS": True,
    "MAIL_USERNAME": MAIL_USERNAME,
    "MAIL_PASSWORD": MAIL_PASSWORD,
    "MAIL_DEFAULT_SENDER": MAIL_USERNAME
})
mail = Mail(app)

# ----------------------🗂️ Utility ----------------------
TEMP_DIR = "temp_audio"
os.makedirs(TEMP_DIR, exist_ok=True)

def speech_to_text(audio_data):
    recognizer = sr.Recognizer()
    try:
        return recognizer.recognize_google(audio_data)
    except sr.UnknownValueError:
        return "Could not understand audio"
    except sr.RequestError:
        return "Could not request results"

def generate_otp():
    # Generate a 6-digit OTP
    return ''.join(random.choices('0123456789', k=6))

# ----------------------🧠 LLM Chatbot ----------------------
@app.route("/chatbot", methods=["POST"])
def chatbot():
    print("Received request:", request.json)  # Debug log
    data = request.json
    question = data.get("question", "").strip()
    email = data.get("email", "").strip()

    if not question:
        return jsonify({"error": "Question is required"}), 400
    if not email:
        return jsonify({"error": "Email is required"}), 400

    try:
        client = groq.Client(api_key=GROQ_API_KEY)
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an Ayurvedic wellness assistant that helps determine "
                        "users' prakriti (body constitution) and provides personalized "
                        "dietary and lifestyle recommendations based on Ayurvedic principles."
                    )
                },
                {"role": "user", "content": question}
            ]
        )
        answer = response.choices[0].message.content.strip()
        print("Sending response:", answer)  # Debug log
        return jsonify({"response": answer})

    except Exception as e:
        print(f"❌ Chatbot API Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# ----------------------🎤 Voice Input ----------------------
@app.route("/voice", methods=["POST"])
def voice():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]
    if not audio_file:
        return jsonify({"error": "Empty audio file"}), 400

    try:
        file_path = os.path.join(TEMP_DIR, "temp_audio.wav")
        audio_file.save(file_path)
        transcript = "Dummy response for testing"  # To be replaced
        return jsonify({"response": transcript})
    except Exception as e:
        return jsonify({"error": f"Voice processing failed: {str(e)}"}), 500

# ----------------------🔐 Auth: Register, Login, Verify ----------------------
@app.route("/check-db", methods=["GET"])
def check_db():
    try:
        cursor.execute("SELECT 1")
        return jsonify({"status": "Database connection successful"}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": f"Database connection failed: {err}"}), 500

@app.route("/register", methods=["POST", "OPTIONS"])
def register():
    if request.method == "OPTIONS":
        return "", 200
    
    try:
        data = request.json
        print(f"📝 Received registration data: {data}")

        # Validate required fields
        required_fields = {
            "full_name": "Full Name",
            "email": "Email Address",
            "phone_number": "Phone Number",
            "age": "Age",
            "password": "Password"
        }
        
        missing_fields = [field_name for field, field_name in required_fields.items() 
                         if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                "success": False,
                "error": f"Please provide: {', '.join(missing_fields)}"
            }), 400

        # Check for existing email
        cursor.execute("SELECT id FROM users WHERE email = %s", (data["email"],))
        if cursor.fetchone():
            return jsonify({
                "success": False,
                "error": "Email already registered"
            }), 409

        # Generate OTP and set expiry to 1.5 minutes
        otp = generate_otp()
        otp_expiry = datetime.now().replace(microsecond=0) + timedelta(seconds=90)  # 1.5 minutes

        # Hash password
        password_hash = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt()).decode()

        # Insert user
        cursor.execute("""
            INSERT INTO users (full_name, email, phone_number, age, password_hash, otp, otp_expiry, verified)
            VALUES (%s, %s, %s, %s, %s, %s, %s, FALSE)
        """, (
            data["full_name"],
            data["email"],
            data["phone_number"],
            data["age"],
            password_hash,
            otp,
            otp_expiry
        ))
        db.commit()

        # Send OTP email with updated expiry time
        msg = Message(
            subject="Email Verification - AyurBot",
            recipients=[data["email"]],
            html=f"""
                <p>Thank you for registering with AyurBot!</p>
                <p>Your OTP for email verification is: <strong>{otp}</strong></p>
                <p>This OTP will expire in 1.5 minutes.</p>
                <p>Best Regards,<br>AyurBot Team</p>
            """
        )
        mail.send(msg)

        return jsonify({
            "success": True,
            "message": "Registration successful! Please check your email for OTP verification.",
            "email": data["email"]
        }), 201

    except Exception as e:
        print(f"❌ Registration error: {str(e)}")
        db.rollback()
        return jsonify({
            "success": False,
            "error": "Registration failed. Please try again."
        }), 500

@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json
    email = data.get("email")
    otp = data.get("otp")

    if not email or not otp:
        return jsonify({
            "success": False,
            "error": "Email and OTP are required"
        }), 400

    try:
        # Check OTP and its expiry
        cursor.execute("""
            SELECT id, otp, otp_expiry
            FROM users 
            WHERE email = %s AND verified = FALSE
        """, (email,))
        
        result = cursor.fetchone()
        if not result:
            return jsonify({
                "success": False,
                "error": "Invalid email or already verified"
            }), 400

        if result['otp'] != otp:
            return jsonify({
                "success": False,
                "error": "Invalid OTP"
            }), 400

        current_time = datetime.now().replace(microsecond=0)
        if current_time > result['otp_expiry']:
            return jsonify({
                "success": False,
                "error": "OTP has expired. Please request a new one."
            }), 400

        # Verify user and clear OTP data
        cursor.execute("""
            UPDATE users 
            SET verified = TRUE, otp = NULL, otp_expiry = NULL 
            WHERE id = %s
        """, (result["id"],))
        db.commit()

        return jsonify({
            "success": True,
            "message": "Email verified successfully! You can now login."
        }), 200

    except Exception as e:
        print(f"❌ OTP verification error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Verification failed"
        }), 500

@app.route("/verify-credentials", methods=["POST", "OPTIONS"])
def verify_credentials():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200 

    data = request.json
    email = data.get("email")
    entered_password = data.get("password")
    entered_otp = data.get("otp")

    if not all([email, entered_password, entered_otp]):
        return jsonify({"error": "Email, password and OTP are required"}), 400
        
    try:
        # Use UNIX_TIMESTAMP for comparison
        cursor.execute("""
            SELECT id, password_hash, otp, UNIX_TIMESTAMP(otp_expiry) as otp_expiry_ts
            FROM users 
            WHERE email = %s AND verified = FALSE
        """, (email,))
        result = cursor.fetchone()
        if not result:
            return jsonify({"error": "Invalid email or already verified"}), 400

        current_timestamp = int(datetime.now().timestamp())
        if current_timestamp > result["otp_expiry_ts"]:
            return jsonify({"error": "OTP has expired"}), 400

        if result["otp"] != entered_otp:
            return jsonify({"error": "Invalid OTP"}), 400

        if not bcrypt.checkpw(entered_password.encode(), result["password_hash"].encode()):
            return jsonify({"error": "Invalid password"}), 400

        cursor.execute("""
            UPDATE users 
            SET verified = TRUE, otp = '', otp_expiry = '' 
            WHERE id = %s
        """, (result["id"],))
        db.commit()

        return jsonify({
            "success": True,
            "message": "Account verified successfully! You can now login."
        }), 200

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

@app.route("/verify/<token>", methods=["GET"])
def verify_email(token):
    try:
        cursor.execute("SELECT id FROM users WHERE verification_token = %s", (token,))
        result = cursor.fetchone()
        if result:
            cursor.execute("UPDATE users SET verified = TRUE, verification_token = NULL WHERE id = %s", (result["id"],))
            db.commit()
            return jsonify({"message": "Email verified successfully!"}), 200
        else:
            return jsonify({"error": "Invalid or expired token!"}), 400
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

@app.route("/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200

    try:
        data = request.json
        print(f"👉 Login attempt for: {data}")  # Debug log

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            print("❌ Missing email or password")
            return jsonify({
                "success": False,
                "error": "Email and password are required!"
            }), 400

        # Check if user exists and is verified
        cursor.execute(
            "SELECT full_name, password_hash, verified FROM users WHERE email = %s",
            (email,)
        )
        user = cursor.fetchone()

        if not user:
            print(f"❌ User not found for email: {email}")
            return jsonify({
                "success": False,
                "error": "Invalid email or password!"
            }), 401

        if not user["verified"]:
            print(f"❌ User not verified: {email}")
            return jsonify({
                "success": False,
                "error": "Please verify your email before logging in"
            }), 401

        # Verify password
        if not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
            print(f"❌ Invalid password for: {email}")
            return jsonify({
                "success": False,
                "error": "Invalid email or password!"
            }), 401

        print(f"✅ Login successful for: {email}")
        return jsonify({
            "success": True,
            "full_name": user["full_name"],
            "email": email,
            "message": "Login successful"
        }), 200

    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@app.route('/api/users/<email>', methods=['GET', 'OPTIONS'])
def get_user(email):
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200
        
    if not email:
        return jsonify({"error": "Email is required"}), 400

    try:
        cursor.execute("""
            SELECT full_name, email, verified
            FROM users 
            WHERE email = %s AND verified = TRUE
        """, (email,))
        result = cursor.fetchone()

        if result:
            return jsonify({
                "success": True,
                "user": {
                    "full_name": result['full_name'],
                    "email": result['email']
                }
            }), 200
        else:
            return jsonify({"error": "User not found"}), 404

    except Exception as e:
        print(f"❌ Error fetching user data: {str(e)}")  # Debug log
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route("/user", methods=["POST", "OPTIONS"])
def user():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200
        
    try:
        data = request.json
        email = data.get("email")
        
        if not email:
            return jsonify({"error": "Email is required"}), 400

        cursor.execute("""
            SELECT full_name, email
            FROM users 
            WHERE email = %s AND verified = TRUE
        """, (email,))
        
        user = cursor.fetchone()
        
        if not user:
            return jsonify({
                "success": False,
                "message": "User not found",
                "user": {
                    "name": "Guest User",
                    "email": email
                }
            }), 404

        return jsonify({
            "success": True,
            "user": {
                "name": user["full_name"],
                "email": user["email"]
            }
        }), 200

    except Exception as e:
        print(f"❌ Error fetching user data: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "user": {
                "name": "Guest User",
                "email": email if email else "unknown"
            }
        }), 500

# ----------------------📨 OTP Resend Endpoint ----------------------
@app.route("/resend-otp", methods=["POST", "OPTIONS"])
def resend_otp():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200

    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    try:
        otp = generate_otp()
        otp_expiry = datetime.now().replace(microsecond=0) + timedelta(seconds=90)  # 1.5 minutes

        cursor.execute("""
            UPDATE users 
            SET otp = %s, otp_expiry = %s 
            WHERE email = %s AND verified = FALSE
        """, (otp, otp_expiry, email))
        
        if cursor.rowcount == 0:
            return jsonify({
                "success": False,
                "error": "Email not found or already verified"
            }), 404

        db.commit()

        msg = Message(
            subject="New OTP Verification - AyurBot",
            recipients=[email],
            html=f"""
                <p>Your new OTP for email verification is: <strong>{otp}</strong></p>
                <p>This OTP will expire in 1.5 minutes.</p>
                <p>Best Regards,<br>AyurBot Team</p>
            """
        )
        mail.send(msg)

        return jsonify({
            "success": True,
            "message": "New OTP sent successfully"
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add test endpoint after the existing routes
@app.route('/test-model-access')
def test_model_access():
    try:
        manifest_path = os.path.join(WEIGHTS_DIR, 'tiny_face_detector_model-weights_manifest.json')
        if not os.path.exists(manifest_path):
            return jsonify({
                'status': 'error',
                'message': f'Manifest file not found at {manifest_path}',
                'exists': False
            })
        
        with open(manifest_path, 'r') as f:
            manifest_content = f.read()
            
        return jsonify({
            'status': 'success',
            'message': 'Model files are accessible',
            'exists': True,
            'content_preview': manifest_content[:100]  # First 100 chars of manifest
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# ----------------------🚀 Main Application ----------------------
if __name__ == "__main__":
    """
    Main entry point of the application
    Runs the Flask server in production mode (debug=False)
    """
    app.run(debug=False)
