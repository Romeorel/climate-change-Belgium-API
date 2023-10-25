const PORT = process.eventNames.PORT || 8000 // deploying on heroku
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')

const app = express()

// Taking mupltile url source data into an object

const newspapers = [
    {
        name: 'thetimes',
        address: 'https://www.thetimes.co.uk/environment/climate-change',
        base: ''
    },
    {
        name: 'guardian',
        address: 'https://www.theguardian.com/environment/climate-crisis',
        base: ''
    },
    {
        name: 'telegraph',
        address: 'https://www.telegraph.co.uk/climate-change',
        base: 'https://www.telegraph.co.uk'
    },
]

const articles = []

//looping through newspapers to scrap the response 
// and load into cheerio

newspapers.forEach(newspaper => {
    axios.get(newspaper.address)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)

            // Taking <a></a> tag conainting 'climate' in it and its href,
            // pushing it into articles array

            $('a:contains("climate")', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')

                articles.push({
                    title,
                    url: newspaper.base + url,
                    source: newspaper.name
                })
             })
        })
})


// On Home page ('/'), if express is listening properly,
// display the message below
app.get('/', (req, res) => {
    res.json('Welcome to Climate change Belgium API')
})


// When visiting localhost:8000/news, getting the html value
// of the url guardian
// if OK, get the response and load it as html from cheerio
app.get('/news', (req, res) => {
    res.json(articles)
})

app.get(`/news/:newspaperId`, (req, res) => {
    const newspaperId = req.params.newspaperId

    const newspaperAddress = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].address
    const newspaperBase = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].base


    axios.get(newspaperAddress)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const specificArticles = []

            $('a:contains("climate")', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')
                specificArticles.push({
                    title,
                    url: newspaperBase + url,
                    source: newspaperId
                })

            })
            res.json(specificArticles)

        }).catch(err => console.log(err))


})

// Checking and console.log the message below 
// if the server is working just fine
app.listen(PORT, () => console.log(`server running on "localhost:${PORT}"`))