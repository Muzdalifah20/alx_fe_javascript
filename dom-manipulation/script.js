window.addEventListener('DOMContentLoaded', () => {

  // Load from localStorage on init (MISSING)
  const savedQuotes = localStorage.getItem('quotes');
  let quotes = savedQuotes ? JSON.parse(savedQuotes) : [
    { id: 1, text: "The only way to do great work is to love what you do.", category: "motivation" },
    { id: 2, text: "Code is like humor. When you have to explain it, it's bad.", category: "programming" },
    { id: 3, text: "Life is what happens when you're busy making other plans.", category: "life" },
    { id: 4, text: "A leader is one who knows the way, goes the way.", category: "leadership" },
    { id: 5, text: "Success usually comes to those who are too busy looking for it.", category: "success" }
  ];

  function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    sessionStorage.setItem('lastQuote', JSON.stringify(quotes[quotes.length-1])); // Session storage
  }

  function createAddQuoteForm(){
     const formContainer = document.createElement('div');
    formContainer.innerHTML = `
      <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
      <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
      <button type="button" onclick="addQuote()">Add Quote</button>
    `;
    return formContainer;
  }

  function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    console.log(`"${randomQuote.text}" - ${randomQuote.category}`);
    return randomQuote;
  }

  const newQuoteBtn = document.getElementById('newQuote');
  const quoteDisplay = document.getElementById('quoteDisplay');

  newQuoteBtn.addEventListener('click', () => {
    const randomQuoteObj = showRandomQuote();
    quoteDisplay.innerHTML = `
      <h2>${randomQuoteObj.text}</h2>
      <h3>${randomQuoteObj.category}</h3>
    `;
  });

  function addQuote(event) {
    event.preventDefault();

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

    quotes.push(newQuote); // FIXED: push FIRST
    saveQuotes(); // FIXED: save AFTER push

    console.log('New quote added: ', newQuote);
    textInput.value = "";
    categoryInput.value = "";
  }

  const form = document.getElementById('quoteForm');
  form.addEventListener('submit', addQuote);

  window.exportQuotes = function(){
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quotes-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  window.importFromJsonFile = function(event){
    const fileReader = new FileReader();
    fileReader.onload = function(e){
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      alert('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
  };
});
