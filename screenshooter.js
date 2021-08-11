const puppeteer = require('puppeteer')

const Screenshot = async () => {
    const yargs = require('yargs/yargs')
    const {hideBin} = require('yargs/helpers')
    const argv = yargs(hideBin(process.argv)).argv
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    var date = new Date();
    var dateId = date.toISOString().replace(/:/g, '-')

    await page.goto(argv.url, {waitUntil: "domcontentloaded"});
    await page.evaluate(() => {
        window.scrollBy(0, 10);
        var cookieConsent = document.getElementById('cc-card');
        let expiry = new Date();
        expiry.setTime(expiry.getTime() + (6 * 30 * 24 * 60 * 60 * 1000)); // six months
        document.cookie = "cookieconsent_status=dismiss; expires=" + expiry.toUTCString();
        cookieConsent.classList.add('uk-hidden');
    })
    await page.setViewport({
        width: argv.width,
        height: argv.height,
    });
    await page.waitForSelector(argv.selector);
    var elements = await page.$$(argv.selector)

    for (let i = 0; i < elements.length; i++) {
        try {
            if (await elements[i].$$eval(argv.subselector, el => el.length) > 0 || !argv.subselector) {
                await elements[i].screenshot({path: `screenshot-${dateId}-${i} .png`})
            }
        } catch (e) {
            console.log(e)
        }
    }

    await browser.close()
}
Screenshot();
