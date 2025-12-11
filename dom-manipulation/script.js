window.addEventListener('DOMContentLoaded', () => {

  // Load from localStorage on init
  const savedQuotes = localStorage.getItem('quotes');
  let quotes = savedQuotes ? JSON.parse(savedQuotes) : [
    { id: 1, text: "The only way to do great work is to love what you do.", category: "motivation" },
    { id: 2, text: "Code is like humor. When you have to explain it, it's bad.", category: "programming" },
    { id: 3, text: "Life is what happens when you're busy making other plans.", category: "life" },
    { id: 4, text: "A leader is one who knows the way, goes the way.", category: "leadership" },
    { id: 5, text: "Success usually comes to those who are too busy looking for it.", category: "success" }
  ];

  // load last selected category or default to 'all'
  let currentCategory = localStorage.getItem('selectedCategory') || 'all';

  const newQuoteBtn = document.getElementById('newQuote');
  const quoteDisplay = document.getElementById('quoteDisplay');
  const categoryFilter = document.getElementById('categoryFilter');

  // save to local storage
  function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
  }

  // extract unique categories and populate dropdown
  function populateCategories() {
    const categories = new Set();
    quotes.forEach(q => {
      if (q.category && q.category.trim()) {
        categories.add(q.category.trim());
      }
    });

    // clear all then add "all"
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      categoryFilter.appendChild(option);
    });

    // restore last selected category if it exists
    if (currentCategory) {
      const options = Array.from(categoryFilter.options).map(o => o.value);
      if (options.includes(currentCategory)) {
        categoryFilter.value = currentCategory;
      } else {
        currentCategory = 'all';
        categoryFilter.value = 'all';
      }
    }
  }

  function createAddQuoteForm() {
    const formContainer = document.createElement('div');
    formContainer.innerHTML = `
      <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
      <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
      <button type="button" onclick="addQuote(event)">Add Quote</button>
    `;
    return formContainer;
  }

  // show random quote, filtered by category
  function showRandomQuote(category = 'all') {
    const filtered = category === 'all'
      ? quotes
      : quotes.filter(q => q.category === category);

    if (filtered.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * filtered.length);
    const randomQuote = filtered[randomIndex];
    console.log(`"${randomQuote.text}" - ${randomQuote.category}`);
    return randomQuote;
  }

  // update displayed quote based on currentCategory
  function filterQuotes() {
    currentCategory = categoryFilter.value;
    localStorage.setItem('selectedCategory', currentCategory);

    const quote = showRandomQuote(currentCategory);
    if (!quote) {
      quoteDisplay.innerHTML = `<p>No quotes found for this category.</p>`;
      return;
    }

    quoteDisplay.innerHTML = `
      <h2>${quote.text}</h2>
      <h3>${quote.category}</h3>
    `;
  }

  // make filterQuotes available if you use onchange="filterQuotes()"
  window.filterQuotes = filterQuotes;

  newQuoteBtn.addEventListener('click', () => {
    const randomQuoteObj = showRandomQuote(currentCategory);
    if (!randomQuoteObj) return;
    quoteDisplay.innerHTML = `
      <h2>${randomQuoteObj.text}</h2>
      <h3>${randomQuoteObj.category}</h3>
    `;
  });

  function addQuote(event) {
    if (event) event.preventDefault();

    const textInput = document.getElementById('newQuoteText');
    const categoryInput = document.getElementById('newQuoteCategory');

    const text = textInput.value.trim();
    const category = categoryInput.value.trim() || 'uncategorized';

    if (!text) {
      alert('Please enter a quote text!');
      return;
    }

    const newQuote = {
      id: Date.now(),
      text: text,
      category: category
    };

    quotes.push(newQuote);
    saveQuotes();
    console.log('New quote added: ', newQuote);

    // update categories if new category added
    populateCategories();

    textInput.value = "";
    categoryInput.value = "";
  }

  const form = document.getElementById('quoteForm');
  form.addEventListener('submit', addQuote);

  window.exportQuotes = function () {
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quotes-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  window.importFromJsonFile = function (event) {
    const fileReader = new FileReader();
    fileReader.onload = function (e) {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
  };

  // Server sync functions (add before initialization)
let syncInterval;

function showStatus(message, isError = false) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.style.color = isError ? 'red' : 'green';
}

async function fetchServerQuotes() {
  try {
    // JSONPlaceholder mock API
    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
    const serverData = await response.json();
    
    // Transform to quote format
    const serverQuotes = serverData.map(post => ({
      id: Date.now() + Math.random(),
      text: post.title,
      category: 'server'
    }));
    
    return serverQuotes;
  } catch (error) {
    console.error('Server fetch failed:', error);
    return [];
  }
}

async function fetchQuotesFromServer() {
  showStatus('Syncing...');
  
  const serverQuotes = await fetchServerQuotes();
  const localIds = quotes.map(q => q.id);
  
  // Server takes precedence - add new server quotes
  serverQuotes.forEach(serverQuote => {
    if (!localIds.includes(serverQuote.id)) {
      quotes.unshift(serverQuote); // Add to beginning
    }
  });
  
  saveQuotes();
  populateCategories();
  showStatus(`Synced ${serverQuotes.length} server quotes!`);
  
  // Show first server quote
  const serverQuote = quotes.find(q => q.category === 'server');
  if (serverQuote) {
    quoteDisplay.innerHTML = `<h2>${serverQuote.text}</h2><h3>${serverQuote.category}</h3>`;
  }
}

// Auto-sync every 30 seconds
function startAutoSync() {
  syncInterval = setInterval(fetchQuotesFromServer, 30000);
}

// Manual sync button
document.getElementById('syncBtn').addEventListener('click', fetchQuotesFromServer);

// Initialize sync
startAutoSync();


  // initialize categories and first view
  populateCategories();
  filterQuotes();
});
