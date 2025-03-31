const { chromium } = require('playwright');

async function getMovieDescription(netflixId) {
    const url = `https://www.netflix.com/in/title/${netflixId}`;
    try {
        const browser = await chromium.launch();
        const page = await browser.newPage();

        // Navigate to the movie URL
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

        // Extract the description from the webpage
        const description = await page.evaluate(() => {
            const descriptionElement = document.querySelector('div.title-info-synopsis[data-uia="title-info-synopsis"]');
            return descriptionElement ? descriptionElement.textContent.trim() : 'No description available';
        });

        await browser.close();
        console.log(description);
        return description;
    } catch (error) {
        console.error(`Error fetching description for Netflix ID ${netflixId}:`, error);
        return 'Error fetching description';
    }
}

// Example usage
getMovieDescription('81752390');
