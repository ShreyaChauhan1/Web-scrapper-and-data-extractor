const puppeteer = require('puppeteer');
const fs = require('fs');
const { Parser } = require('json2csv');


async function searchAndExtractProductDetails(query) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://www.flipkart.com');
    await page.waitForSelector('input.Pke_EE');


    await page.type('input.Pke_EE', query);
    await page.keyboard.press('Enter');
    console.log(`Searching for: ${query}`);

    try {
        await page.waitForSelector('img.DByuf4', { timeout: 30000 });
    } catch (error) {
        console.log('Error while waiting for products to load:', error.message);
        await browser.close();
        return;
    }


    const productDetails = await page.evaluate(() => {
        const products = [];
        const productElements = document.querySelectorAll('div.tUxRFH');


        productElements.forEach(productElement => {
            const productName = productElement.querySelector('.KzDlHZ')?.innerText || 'No product name';
            

            const specs = [];
            const specElements = productElement.querySelectorAll('.G4BRas .J+igdf');
            specElements.forEach(spec => specs.push(spec.innerText));


            const price = productElement.querySelector('.Nx9bqj._4b5DiR')?.innerText || 'No price';
            const originalPrice = productElement.querySelector('.yRaY8j.ZYYwLA')?.innerText || 'No original price';
            const discount = productElement.querySelector('.UkUFwK span')?.innerText || 'No discount';


            products.push({
                name: productName,
                specifications: specs.join('; '),
                price: price,
                originalPrice: originalPrice,
                discount: discount,
            });
        });

        return products;
    });

    const parser = new Parser();
    const csv = parser.parse(productDetails);


    const filePath = 'flipkart_iphone15pro.csv';
    fs.writeFileSync(filePath, csv, 'utf-8');
    console.log(`Data saved to ${filePath}`);

    await browser.close();
}


(async () => {
    const searchTerm = 'iPhone 15 Pro';
    await searchAndExtractProductDetails(searchTerm);
})();
