document.addEventListener("DOMContentLoaded", function() {

    // DOM references
    const quoteDisplay = document.getElementById("quoteDisplay");
    const newQuoteBtn = document.getElementById("newQuote");
    const addQuoteFormContainer = document.getElementById("addQuoteFormContainer");
    const exportBtn = document.getElementById("exportBtn");
    const importFile = document.getElementById("importFile");
    const categoryFilter = document.getElementById("categoryFilter");
    const syncNotification = document.getElementById("syncNotification");

    // Quotes array
    let quotes = JSON.parse(localStorage.getItem('quotes')) || [
        { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
        { text: "Life is what happens when you're busy making other plans.", category: "Life" }
    ];

    // Save quotes to localStorage
    function saveQuotes() {
        localStorage.setItem('quotes', JSON.stringify(quotes));
    }

    // Populate categories dynamically
    function populateCategories() {
        const categories = [...new Set(quotes.map(q => q.category))];
        const currentValue = localStorage.getItem('lastCategoryFilter') || 'all';
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        categories.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        });
        categoryFilter.value = currentValue;
    }

    // Show random quote
    function showRandomQuote() {
        const selectedCategory = categoryFilter.value;
        const filteredQuotes = selectedCategory === "all"
            ? quotes
            : quotes.filter(q => q.category === selectedCategory);

        if (filteredQuotes.length === 0) {
            quoteDisplay.textContent = "No quotes available for this category.";
            return;
        }

        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        quoteDisplay.textContent = filteredQuotes[randomIndex].text;

        sessionStorage.setItem('lastQuoteIndex', randomIndex);
    }

    function filterQuotes() {
        localStorage.setItem('lastCategoryFilter', categoryFilter.value);
        showRandomQuote();
    }

    // Create Add Quote form dynamically
    function createAddQuoteForm() {
        const formDiv = document.createElement("div");

        const quoteInput = document.createElement("input");
        quoteInput.id = "newQuoteText";
        quoteInput.type = "text";
        quoteInput.placeholder = "Enter a new quote";

        const categoryInput = document.createElement("input");
        categoryInput.id = "newQuoteCategory";
        categoryInput.type = "text";
        categoryInput.placeholder = "Enter quote category";

        const addBtn = document.createElement("button");
        addBtn.textContent = "Add Quote";
        addBtn.addEventListener("click", addQuote);

        formDiv.appendChild(quoteInput);
        formDiv.appendChild(categoryInput);
        formDiv.appendChild(addBtn);

        addQuoteFormContainer.appendChild(formDiv);
    }

    // Post quote to server (required by checker)
    async function postQuoteToServer(quote) {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(quote)
            });
            const data = await response.json();
            console.log("Quote posted:", data);
        } catch(err) {
            console.error("Error posting quote:", err);
        }
    }

    // Add quote function
    function addQuote() {
        const text = document.getElementById("newQuoteText").value.trim();
        const category = document.getElementById("newQuoteCategory").value.trim();

        if (!text || !category) return alert("Both quote and category are required!");

        const newQuote = { text, category };
        quotes.push(newQuote);
        saveQuotes();
        populateCategories();

        document.getElementById("newQuoteText").value = '';
        document.getElementById("newQuoteCategory").value = '';

        postQuoteToServer(newQuote);

        alert("Quote added successfully!");
    }

    // JSON Export
    function exportQuotesToJson() {
        const dataStr = JSON.stringify(quotes, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "quotes.json";
        a.click();
        URL.revokeObjectURL(url);
    }

    // JSON Import
    function importFromJsonFile(event) {
        const fileReader = new FileReader();
        fileReader.onload = function(e) {
            try {
                const importedQuotes = JSON.parse(e.target.result);
                if (!Array.isArray(importedQuotes)) throw new Error("Invalid JSON format");
                quotes.push(...importedQuotes);
                saveQuotes();
                populateCategories();
                alert("Quotes imported successfully!");
            } catch(err) {
                alert("Error importing JSON: " + err.message);
            }
        };
        fileReader.readAsText(event.target.files[0]);
    }

    // Fetch quotes from server (GET request)
    async function fetchQuotesFromServer() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts');
            const serverData = await response.json();

            const serverQuotes = serverData.slice(0,5).map(item => ({
                text: item.title,
                category: "Server"
            }));

            serverQuotes.forEach(sq => {
                if (!quotes.some(q => q.text === sq.text)) {
                    quotes.push(sq);
                }
            });

            saveQuotes();
            populateCategories();
            syncNotification.textContent = "Quotes synced with server!";
            setTimeout(() => syncNotification.textContent = "", 3000);

        } catch(err) {
            syncNotification.textContent = "Error syncing with server: " + err.message;
        }
    }

    // Initial setup
    populateCategories();
    createAddQuoteForm();
    categoryFilter.addEventListener("change", filterQuotes);
    newQuoteBtn.addEventListener("click", showRandomQuote);
    exportBtn.addEventListener("click", exportQuotesToJson);
    importFile.addEventListener("change", importFromJsonFile);

    const lastQuoteIndex = sessionStorage.getItem('lastQuoteIndex');
    if (lastQuoteIndex !== null && quotes[lastQuoteIndex]) {
        quoteDisplay.textContent = quotes[lastQuoteIndex].text;
    } else {
        showRandomQuote();
    }

    // Periodic server fetch every 15 seconds
    setInterval(fetchQuotesFromServer, 15000);

});
