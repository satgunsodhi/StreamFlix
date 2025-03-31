const { chromium } = require('playwright');
const cheerio = require('cheerio');
const fs = require('fs');

async function getImageLinks(url, outputFilePath) {
    try {
        const browser = await chromium.launch();
        const page = await browser.newPage();

        // Set a large viewport size
        await page.setViewportSize({ width: 19200, height: 10800 });

        // Navigate to the URL with increased timeout
        await page.goto(url, { 
            waitUntil: 'networkidle',
            timeout: 60000 // Increase timeout to 60 seconds
        });

        // Wait for content to load and scroll
        await page.evaluate(() => {
            return new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if(totalHeight >= scrollHeight){
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });

        // Wait for any title element to be visible with increased timeout
        await page.waitForSelector('.nm-collections-title', { 
            timeout: 30000,
            state: 'visible'
        });

        // Extract genre from the webpage
        const genre = await page.evaluate(() => {
            const genreElement = document.querySelector('.nm-collections-metadata-title'); // Selector for genre
            return genreElement ? genreElement.textContent.trim() : 'Unknown Genre';
        });

        // Extract links, image sources, and titles directly from the DOM
        const movieData = await page.evaluate(() => {
            const data = [];
            document.querySelectorAll('a.nm-collections-title').forEach((movie, index) => {
                const img = movie.querySelector('img.nm-collections-title-img'); // Image element
                const href = movie.getAttribute('href'); // Movie link
                
                // Try multiple selectors for the title
                const titleElement = movie.querySelector('.fallback-text') || 
                                   movie.querySelector('.nm-collections-title-name') ||
                                   movie.querySelector('.title');
                const title = titleElement ? titleElement.textContent.trim() : 
                             img?.getAttribute('alt')?.trim() || '';

                const imgSrc = img?.getAttribute('src'); // Image source
                const fullLink = href ? (href.startsWith('http') ? href : `https://www.netflix.com${href}`) : null;
                const nid = href ? href.slice(-8) : null; // Extract last 8 digits from the link

                if (imgSrc && fullLink && nid) {
                    data.push({
                        id: index + 1, // Serial number starting from 1
                        title: title,
                        image: imgSrc,
                        nid: nid
                    });
                }
            });
            return data;
        });

        console.log('Extracted movie data:', movieData); // Debug log to verify the structure

        await browser.close();

        // Append the genre and data to a file
        const outputData = {
            [genre]: movieData // Wrap movie data in an array under the genre key
        };
        fs.appendFileSync(outputFilePath, JSON.stringify(outputData, null, 2) + ',\n', 'utf-8');
        console.log(`Movie data appended to ${outputFilePath}`);
        return outputData;
    } catch (error) {
        console.error('Error fetching the page:', error);
        return [];
    }
}

// Example usage
getImageLinks('https://www.netflix.com/in/browse/genre/43040', 'movie_data.json');x