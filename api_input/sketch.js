// Input: Data from newsapi.org
// Visual result: something in 3D

// ----------------------

// https://newsapi.org/docs/get-started#top-headlines

let newsData;
// API key being called using window.apiKey - no import/export needed.

function setup() {
  createCanvas(800, 600);
  background(220);

  // Fetch top headlines (customize based on your choice)
  let url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;
  loadJSON(url, gotData, 'json');
}

function draw() {
  background(220);
  if (newsData) {
    textSize(16);
    fill(0);
    let y = 20;
    for (let i = 0; i < newsData.articles.length; i++) {
      text(newsData.articles[i].title, 10, y, width - 20, 100);
      y += 40;
      if (y > height) break; // Stop if the canvas overflows
    }
  }
}

function gotData(data) {
  newsData = data;
}
