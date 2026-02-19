from flask import Flask, render_template, request, send_from_directory
import os

app = Flask(__name__, template_folder='.')

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    # Ensure current directory is correct
    print("Doctor Prescription Portal starting...")
    print("Serving from:", os.getcwd())
    app.run(port=5000, debug=True)
