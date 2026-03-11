from flask import Flask, request, jsonify
from flask_cors import CORS
from google.oauth2 import id_token
from google.auth.transport import requests

app = Flask(__name__)
CORS(app) # Allow React to talk to Flask

CLIENT_ID = ""

@app.route('/api/auth/google', methods=['POST'])
def google_auth():
    token = request.json.get('token')
    
    try:
        # Specify the CLIENT_ID of the app that accesses the backend:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)

        # ID token is valid. Get the user's Google ID and email.
        userid = idinfo['sub']
        email = idinfo['email']
        name = idinfo.get('name')

        # Logic: Check if user exists in your DB, if not, create them.
        return jsonify({
            "status": "success",
            "user": {"id": userid, "email": email, "name": name}
        }), 200

    except ValueError:
        # Invalid token
        return jsonify({"status": "error", "message": "Invalid token"}), 400

if __name__ == '__main__':
    app.run(port=5000, debug=True)