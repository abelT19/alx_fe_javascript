document.addEventListener("DOMContentLoaded", function() {

    // DOM references
    const quoteDisplay = document.getElementById("quoteDisplay");
    const newQuoteBtn = document.getElementById("newQuote");
    const addQuoteFormContainer = document.getElementById("addQuoteFormContainer");
    const exportBtn = document.getElementById("exportBtn");
    const importFile = document.getElementById("importFile");
    const categoryFilter = document.getElementById("categoryFilter"); // exact variable

    // Quotes array
    let quotes = JSON.parse(localStorage.getItem('quotes')) || [
        { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
        { text: "Life is what happens when you're busy making other plans.", category: "Life" },
        { text: "Don't watch the clock; do what it does. Keep going.", category: "Motivation" },
        { text: "Be yourself; everyone else is already taken.", category: "Humor" }
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

    // Show random quote based on selected category
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

    // Filter quotes when category changes
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

    // Add quote function
    function addQuote() {
        const text = document.getElementById("newQuoteText").value.trim();
        const category = document.getElementById("newQuoteCategory").value.trim();

        if (!text || !category) return alert("Both quote and category are required!");

        quotes.push({ text, category });
        saveQuotes();
        populateCategories();

        document.getElementById("newQuoteText").value = '';
        document.getElementById("newQuoteCategory").value = '';

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

    // Initial setup
    populateCategories();
    createAddQuoteForm();
    categoryFilter.addEventListener("change", filterQuotes);
    newQuoteBtn.addEventListener("click", showRandomQuote);
    exportBtn.addEventListener("click", exportQuotesToJson);
    importFile.addEventListener("change", importFromJsonFile);

    // Display last quote if any
    const lastQuoteIndex = sessionStorage.getItem('lastQuoteIndex');
    if (lastQuoteIndex !== null && quotes[lastQuoteIndex]) {
        quoteDisplay.textContent = quotes[lastQuoteIndex].text;
    } else {
        showRandomQuote();
    }

});
