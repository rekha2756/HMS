from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

# simple memory (for demo)
user_context = {
    "name": None
}

def get_reply(user_msg):
    text = user_msg.lower()

    # store name
    if "my name is" in text:
        name = text.split("my name is")[-1].strip().title()
        user_context["name"] = name
        return f"Nice to meet you, {name}! How can I assist you today?"

    # greetings
    if any(word in text for word in ["hi", "hello", "hey"]):
        if user_context["name"]:
            return f"Hello {user_context['name']}! How can I help you today?"
        return random.choice([
            "Hello! Welcome to our hospital 😊",
            "Hi there! How can I assist you?",
            "Hey! Need help with hospital services?"
        ])

    # appointment
    if any(word in text for word in ["appointment", "book", "schedule"]):
        return random.choice([
            "You can book an appointment by providing your name, department, and preferred date.",
            "Please tell me the doctor or department and your preferred time.",
            "I can help you book an appointment. Which department do you need?"
        ])

    # doctors
    if "doctor" in text or "specialist" in text:
        return (
            "We have specialists in:\n"
            "- Cardiology ❤️\n"
            "- Orthopedics 🦴\n"
            "- Neurology 🧠\n"
            "- Pediatrics 👶\n"
            "- General Medicine 🩺\n"
            "Which one do you need?"
        )

    # specific departments
    if "cardio" in text:
        return "Dr. Priya Sharma (Cardiologist) is available from 10 AM to 2 PM."

    if "ortho" in text:
        return "Dr. Rajesh Kumar handles orthopedic cases (9 AM - 1 PM)."

    if "neuro" in text:
        return "Dr. Ananya Singh is available for neurology consultations."

    if "pediatric" in text or "child" in text:
        return "Dr. Meera Patil is our pediatrician."

    # reports
    if "report" in text:
        return "Please provide your Patient ID to view lab reports."

    # billing
    if "bill" in text:
        return "Please provide your Bill ID or Patient ID for billing details."

    # emergency
    if "emergency" in text or "urgent" in text:
        return "🚨 Please call 108 or visit emergency immediately."

    # thanks
    if "thank" in text:
        return random.choice([
            "You're welcome 😊",
            "Happy to help!",
            "Take care!"
        ])

    if "help" in text or "call" in text:
        return "📞 You can call our customer support at +91-9876543210 for assistance."

    # fallback
    return random.choice([
    "I'm not sure I understood. Can you rephrase?\n📞 Call: +91-9876543210",
    "I can help with appointments, doctors, reports, and billing.\n📞 Support: +91-9876543210",
    "Please ask something related to hospital services.\n📞 Need help? Call: +91-9876543210"
])


@app.route("/chat", methods=["POST"])
def chat():
    user_msg = request.json.get("message", "")
    reply = get_reply(user_msg)
    return jsonify({"reply": reply})


if __name__ == "__main__":
    app.run(port=5000, debug=True)