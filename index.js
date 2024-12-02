
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const articles = [];
let nextId = 1;


const index = {};

app.post('/articles', (req, res) => {
    const { title, content, tags } = req.body;

    if (!title || !content) {
        return res.status(400).send({ error: 'Title and content are required' });
    }

    const article = {
        id: nextId++,
        title,
        content,
        tags: tags || [],
        date: new Date(),
    };

  
    articles.push(article);

   
    const keywords = title.split(/\s+/).concat(content.split(/\s+/));
    keywords.forEach((word) => {
        const lowerWord = word.toLowerCase();
        if (!index[lowerWord]) index[lowerWord] = [];
        index[lowerWord].push(article.id);
    });

    res.status(201).send({ message: 'Article added successfully', article });
});

app.get('/articles/search', (req, res) => {
    const { keyword, tag } = req.query;

    if (!keyword && !tag) {
        return res.status(400).send({ error: 'Please provide a keyword or tag to search.' });
    }

    let matchingIds = new Set();

    if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        if (index[lowerKeyword]) {
            index[lowerKeyword].forEach((id) => matchingIds.add(id));
        }
    }

    if (tag) {
        articles.forEach((article) => {
            if (article.tags.includes(tag)) {
                matchingIds.add(article.id);
            }
        });
    }

    const results = Array.from(matchingIds)
        .map((id) => articles.find((article) => article.id === id))
        .sort((a, b) => {
            if (keyword) {
                const freqA = (a.title + ' ' + a.content).toLowerCase().split(keyword.toLowerCase()).length - 1;
                const freqB = (b.title + ' ' + b.content).toLowerCase().split(keyword.toLowerCase()).length - 1;
                return freqB - freqA; 
            }
            return new Date(b.date) - new Date(a.date);
        });

    res.send({ results });
});

app.get('/articles/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);

    const article = articles.find((article) => article.id === id);
    if (!article) {
        return res.status(404).send({ error: 'Article not found' });
    }

    res.send(article);
});

