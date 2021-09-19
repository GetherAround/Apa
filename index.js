const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const cheerio = require('cheerio');
const express = require('express')
const app = express()
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Apa Anjing?')
})

let browser;

async function StartBrowser()
{
    browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null
    });
    return browser;
}

async function CheckShopee(url) {
    try {
        const browser = await StartBrowser();
        let target_barang = [
            url
        ]
        const page = await browser.newPage();
        await page.goto(target_barang[0], { waitUntil: 'domcontentloaded' })
        await page.waitForSelector('.Ybrg9j')
        const bodyHandle = await page.$('body');
        const html = await page.evaluate(body => body.innerHTML, bodyHandle);
        await bodyHandle.dispose();
        const $ = cheerio.load(html)
        const tersisa = await $('div > div > div.flex.items-center > div:nth-child(2)').text().split('tersisa ')[1];
        const harga = await $('div > div > div > div > div.flex.items-center > div.Ybrg9j').text()
        const statusTersedia = await $('button.btn.btn-solid-primary.btn--l.YtgjXY').attr('aria-disabled')
        const ada = statusTersedia !== false ? 'Ada' : 'Sold Out'
        let data = {
            banyak : tersisa,
            harga : harga,
            status : ada
        }
        browser.close()
        return data;
    } catch (e) {
        throw e;
    }
}
app.get('/g', async (req, res) => {
    let x;
    try {
        console.log(req.query.url)
        x = await CheckShopee(req.query.url)
    } catch (e) {
        if(browser) browser.close();
        x = e;
    }
    await res.send(x);
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})