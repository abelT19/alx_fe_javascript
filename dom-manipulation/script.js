// Rename this function
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
        syncNotification.textContent = "Quotes synced with server successfully!";
        setTimeout(() => syncNotification.textContent = "", 3000);

    } catch(err) {
        syncNotification.textContent = "Error syncing with server: " + err.message;
    }
}

// Replace setInterval call with the new function name
setInterval(fetchQuotesFromServer, 15000);
