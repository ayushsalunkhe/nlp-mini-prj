from flask import Flask, render_template, request, jsonify
import re
import math
from collections import Counter

app = Flask(__name__)


# Common English words that should not be considered keywords
STOP_WORDS = {
    "a", "an", "the", "and", "or", "but", "if", "then", "than",
    "this", "that", "these", "those", "is", "are", "was", "were",
    "be", "been", "being", "to", "of", "in", "on", "at", "for",
    "from", "with", "by", "about", "as", "into", "through", "during",
    "before", "after", "above", "below", "between", "out", "up",
    "down", "over", "under", "again", "further", "once", "here",
    "there", "all", "any", "both", "each", "few", "more", "most",
    "other", "some", "such", "no", "nor", "not", "only", "own",
    "same", "so", "too", "very", "can", "will", "just", "should",
    "could", "would", "may", "might", "must", "shall",
    "i", "me", "my", "myself", "we", "our", "ours", "you",
    "your", "yours", "he", "him", "his", "she", "her", "it",
    "its", "they", "them", "their", "what", "which", "who",
    "whom", "when", "where", "why", "how",
    "do", "does", "did", "doing", "have", "has", "had",
    "having", "am", "also", "because", "while", "whereas",
    "get", "got", "getting", "like", "well", "many"
}


def clean_text(text):
    """
    Convert text into lowercase words.
    """
    text = text.lower()

    # Extract words containing letters/numbers
    words = re.findall(r'\b[a-zA-Z][a-zA-Z0-9-]*\b', text)

    return words


def calculate_keywords(text, top_n=15):
    """
    Extract keywords using frequency + TF-IDF inspired scoring.
    """

    words = clean_text(text)

    # Remove stop words and very short words
    filtered_words = [
        word for word in words
        if word not in STOP_WORDS and len(word) > 2
    ]

    if not filtered_words:
        return []

    # Count frequency
    frequency = Counter(filtered_words)

    total_words = len(filtered_words)

    # Calculate scores
    keyword_data = []

    for word, count in frequency.items():

        # Term Frequency
        tf = count / total_words

        # Give a slight bonus to longer words
        length_bonus = min(len(word) / 10, 1.5)

        # Final score
        score = tf * length_bonus

        keyword_data.append({
            "keyword": word,
            "frequency": count,
            "score": score
        })

    # Sort by score
    keyword_data.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    # Normalize score to 0-100
    if keyword_data:
        max_score = keyword_data[0]["score"]

        for item in keyword_data:
            item["score"] = round(
                (item["score"] / max_score) * 100,
                2
            )

    return keyword_data[:top_n]


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/extract", methods=["POST"])
def extract_keywords():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data received."
            }), 400

        text = data.get("text", "").strip()

        if not text:
            return jsonify({
                "success": False,
                "message": "Please enter some text."
            }), 400

        if len(text) < 20:
            return jsonify({
                "success": False,
                "message": "Please enter at least 20 characters."
            }), 400

        keywords = calculate_keywords(text)

        if not keywords:
            return jsonify({
                "success": False,
                "message": "Could not find meaningful keywords."
            }), 400

        return jsonify({
            "success": True,
            "keywords": keywords,
            "total_words": len(clean_text(text)),
            "unique_words": len(set(clean_text(text)))
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": "Something went wrong while processing the text."
        }), 500


if __name__ == "__main__":
    app.run(debug=True)