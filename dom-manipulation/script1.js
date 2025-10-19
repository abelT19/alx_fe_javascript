// Load quotes from local storage or use default
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Don't watch the clock; do what it does. Keep going.", category: "Motivation" },
  { text: "Be yourself; everyone else is already taken.", category: "Humor" }
];

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteFormContainer = document.getElementById("addQuoteFormContainer");
const exportBtn = document.getElementById("exportBtn");
const categoryFilter = document.getElementById("categoryFilter");

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Populate categories dynamically
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  
  // Preserve "All Categories" option
  const currentValue = localStorage.getItem('lastCategoryFilter') || 'all';
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  categoryFilter.value = currentValue;
}

// Show random quote based on selected filter
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

  // Save last shown quote in session storage
  sessionStorage.setItem('lastQuoteIndex', randomIndex);
}

// Filter quotes based on category selection
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

// Add a new quote
function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!quoteText || !quoteCategory) {
    alert("Both quote text and category are required!");
    return;
  }

  quotes.push({ text: quoteText, category: quoteCategory });
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
      alert('Quotes imported successfully!');
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

// Show last quote from session storage on load
const lastQuoteIndex = sessionStorage.getItem('lastQuoteIndex');
if (lastQuoteIndex !== null && quotes[lastQuoteIndex]) {
  quoteDisplay.textContent = quotes[lastQuoteIndex].text;
} else {
  showRandomQuote();
}
