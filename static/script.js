const textInput = document.getElementById("textInput");
const extractButton = document.getElementById("extractButton");
const clearButton = document.getElementById("clearButton");

const wordCounter = document.getElementById("wordCounter");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");

const results = document.getElementById("results");
const keywordList = document.getElementById("keywordList");

const totalWords = document.getElementById("totalWords");
const uniqueWords = document.getElementById("uniqueWords");


// ------------------------------------
// Word Counter
// ------------------------------------

textInput.addEventListener("input", function () {

    const text = textInput.value.trim();

    if (!text) {
        wordCounter.textContent = "0 words";
        return;
    }

    const words = text.split(/\s+/);

    wordCounter.textContent =
        `${words.length} words`;
});


// ------------------------------------
// Extract Keywords
// ------------------------------------

extractButton.addEventListener("click", async function () {

    const text = textInput.value.trim();


    // Validate input
    if (!text) {

        showError(
            "Please enter some text first."
        );

        return;
    }


    if (text.length < 20) {

        showError(
            "Please enter at least 20 characters."
        );

        return;
    }


    // Reset UI
    hideError();

    results.classList.add("hidden");

    loading.classList.remove("hidden");

    extractButton.disabled = true;


    try {

        const response = await fetch(
            "/extract",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    text: text
                })
            }
        );


        const data = await response.json();


        if (!data.success) {

            showError(
                data.message ||
                "Unable to extract keywords."
            );

            return;
        }


        displayResults(data);

    }

    catch (error) {

        showError(
            "Could not connect to the server. " +
            "Make sure the Flask server is running."
        );

    }

    finally {

        loading.classList.add("hidden");

        extractButton.disabled = false;
    }

});


// ------------------------------------
// Display Results
// ------------------------------------

function displayResults(data) {

    totalWords.textContent =
        data.total_words;

    uniqueWords.textContent =
        data.unique_words;


    keywordList.innerHTML = "";


    data.keywords.forEach(
        function (item, index) {

            const keywordItem =
                document.createElement("div");

            keywordItem.className =
                "keyword-item";


            keywordItem.innerHTML = `

                <div class="keyword-top">

                    <span class="keyword-name">
                        ${index + 1}. ${escapeHTML(item.keyword)}
                    </span>

                    <span class="keyword-score">
                        ${item.score}%
                    </span>

                </div>


                <div class="progress">

                    <div
                        class="progress-bar"
                        style="width: ${item.score}%">
                    </div>

                </div>


                <div class="keyword-bottom">

                    <span>
                        Frequency:
                        ${item.frequency}
                    </span>

                    <span>
                        Relevance Score
                    </span>

                </div>

            `;


            keywordList.appendChild(
                keywordItem
            );
        }
    );


    results.classList.remove(
        "hidden"
    );


    // Scroll to results
    results.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ------------------------------------
// Clear Button
// ------------------------------------

clearButton.addEventListener(
    "click",
    function () {

        textInput.value = "";

        wordCounter.textContent =
            "0 words";

        results.classList.add(
            "hidden"
        );

        hideError();

        textInput.focus();
    }
);


// ------------------------------------
// Error Functions
// ------------------------------------

function showError(message) {

    errorMessage.textContent =
        message;

    errorMessage.classList.remove(
        "hidden"
    );
}


function hideError() {

    errorMessage.classList.add(
        "hidden"
    );
}


// ------------------------------------
// Security Helper
// ------------------------------------

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}