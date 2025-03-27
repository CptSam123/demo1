from flask import Flask, request, jsonify
from flask_cors import CORS                      # ✅ Add this line
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import os

app = Flask(__name__)
CORS(app)  # ✅ Enable CORS for all routes

# Secret key for JWT
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'devsecret')

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client['chatbot_platform']
super_admins = db['super_admins']

# Default super admin user (on startup)
def init_super_admin():
    default_email = "admin@platform.com"
    default_password = "admin123"

    existing_admin = super_admins.find_one({"email": default_email})
    if not existing_admin:
        hashed_pw = generate_password_hash(default_password)
        super_admins.insert_one({
            "email": default_email,
            "password": hashed_pw,
            "created_at": datetime.datetime.utcnow()
        })
        print("[Init] Default super admin created.")
    else:
        print("[Init] Super admin already exists.")

# Login route
@app.route('/api/super-admin/login', methods=['POST'])
def super_admin_login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    admin = super_admins.find_one({"email": email})
    if not admin or not check_password_hash(admin['password'], password):
        return jsonify({"error": "Invalid credentials."}), 401

    token = jwt.encode({
        'email': email,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }, app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({"token": token}), 200

if __name__ == '__main__':
    with app.app_context():
        init_super_admin()
    app.run(debug=True, port=5000)
