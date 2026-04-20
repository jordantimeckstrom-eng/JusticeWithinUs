from flask import Flask, jsonify, request
from flask_socketio import SocketIO
import os

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")


@app.route('/api/ledgerbridge/email', methods=['POST'])
def ingest_email():
    data = request.json or {}
    bid = {
        "fromName": data.get("fromName", "Legacy Monitor"),
        "amount": data.get("amount", 0),
        "body": data.get("ghostNote", "A whisper from the old monitors"),
    }

    # Push instantly to every connected browser
    socketio.emit('new_bid', bid)

    return jsonify({
        "status": "ceremony received",
        "hash": os.urandom(8).hex(),
    }), 200


@socketio.on('connect')
def handle_connect():
    print("🌌 Temple client connected — ready for ceremonies")


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
