window.addEventListener('DOMContentLoaded', () => {

  const quotes = [
    { id: 1, text: "The only way to do great work is to love what you do.", category: "motivation" },
    { id: 2, text: "Code is like humor. When you have to explain it, it's bad.", category: "programming" },
    { id: 3, text: "Life is what happens when you're busy making other plans.", category: "life" },
    { id: 4, text: "A leader is one who knows the way, goes the way.", category: "leadership" },
    { id: 5, text: "Success usually comes to those who are too busy looking for it.", category: "success" }
  ];

  // 1) Show random quote
  function randomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    console.log(`"${randomQuote.text}" - ${randomQuote.category}`);
    return randomQuote;
  }

  const newQuoteBtn = document.getElementById('newQuote');
  const quoteDisplay = document.getElementById('quoteDisplay');

  newQuoteBtn.addEventListener('click', () => {
    const randomQuoteObj = randomQuote();
    quoteDisplay.innerHTML = `
      <h2>${randomQuoteObj.text}</h2>
      <h3>${randomQuoteObj.category}</h3>
    `;
  });

  // 2) Add quote from form
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

    quotes.push(newQuote);
    console.log('New quote added: ', newQuote);

    // clear inputs
    textInput.value = "";
    categoryInput.value = "";
  }

  // attach submit handler to the form
  const form = document.getElementById('quoteForm');
  form.addEventListener('submit', addQuote);
});
