const puppeteer = require('puppeteer')

const Screenshot = async () => {
    const yargs = require('yargs/yargs')
    const {hideBin} = require('yargs/helpers')
    const argv = yargs(hideBin(process.argv)).argv
    const width = 1200;
    const height = 1800;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const fs = require('fs')
    const filename = process.argv[2];
    let config = '';

    const cookie = async function () {
        await page.evaluate(() => {
            window.scrollBy(0, 10);
            var cookieConsent = document.getElementById('cc-card');
            cookieConsent.classList.add('uk-hidden');
        })
    }
    fs.readFile(filename, 'utf8', async function (err, data) {
        config = data != null ? JSON.parse(data) : argv;
        let lengthUrl = data != null ? config.urls.length : 1;
        if (config.destination !== null && !fs.existsSync(`.${config.destination}`)) {
            fs.mkdirSync(`.${config.destination}`)
        }
        var date = new Date();
        var dateId = date.toISOString().replace(/:/g, '-')

        for (let i = 0; i < lengthUrl; i++) {
            let url = config.urls ? config.urls[i].url : config.url
            await page.goto(url, {waitUntil: "domcontentloaded"});
            await page.setViewport({
                width: config.viewportWidth ? config.viewportWidth : width,
                height: config.viewportHeight ? config.viewportHeight : height
            });

            var testElement = await page.$$(`${config.testSelector}`)
            if (testElement.length < 1) {
                console.log(url)
                continue;
            }

            await cookie();

            try {
                await page.waitForSelector(`${config.selector}`, {timeout: 5000})
            } catch (error) {
                console.log(error, url)
                continue;
            }

            var elements = await page.$$(`${config.selector}`)

            for (let j = 0; j < elements.length; j++) {
                try {
                    if (config.subselector == null || await elements[j].$$eval(`${config.subselector}`, el => el.length) > 0) {
                        await elements[j].screenshot({path: `.${config.destination ? config.destination : ''}/${config.urls[i].screenshotPrefix ? config.urls[i].screenshotPrefix : 'screenshot'}-${dateId}-${i}${j}.png`})
                    }
                } catch (e) {
                    console.log(e)
                }
            }
        }
        await browser.close()
    });
}
Screenshot();
