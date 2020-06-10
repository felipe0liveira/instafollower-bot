const puppeteer = require(`puppeteer`);
const chalk = require(`chalk`);
const dotenv = require(`dotenv`);
const config = require(`./config.json`);

(async () => {
    try {
        console.clear();
        dotenv.config();
        console.log(`\n # Initializing ${chalk.blueBright(`Puppeteer`)}\n`);
        const browser = await puppeteer.launch({ headless: config.bot.headless });
        const page = await browser.newPage();

        // Go to Instagram
        console.log(` - Going to ${chalk.redBright(`instagram`)}`);
        await page.goto(config.instagram.defaultURL);
        await page.waitFor(3000);

        // Sign In
        console.log(` - Signing In`);
        await page.type(`input[name="username"]`, process.env.INSTAGRAM_USERNAME);
        await page.type(`input[name="password"]`, process.env.INSTAGRAM_PASSWORD);

        await page.click('button[type=submit]');
        await page.waitFor(3000);

        await page.setViewport({ width: 375, height: 812 });
        await page.waitFor(1000);

        let target = {};
        for (let i = 0; i < config.instagram.targets.length; i++) {
            console.clear();
            target = config.instagram.targets[i];
            console.log(` # Going to '${chalk.redBright(target)}' profile`);
            await page.goto(`${config.instagram.defaultURL}/${target}`);
            await page.waitFor(5000);

            console.log(` - Opening it's ${chalk.redBright(`followers`)}`);
            await page.click('body section main div > ul li:nth-child(2) a');
            await page.waitFor(5000);

            const buttons = await page.$$('button');
            let followingCount = 0;
            let button = {};

            for (let index = 0; index < config.instagram.followsPerUser; index++) {
                button = buttons[index];
                let textContent = await button.evaluate(e => e.textContent);
                textContent = textContent.trim().toLowerCase();

                if (textContent === `follow` || textContent === `seguir`) {
                    await page.evaluate(() => window.scroll(0, window.innerHeight));
                    await page.waitFor(500);
                    await button.evaluate(e => e.click());
                    await page.waitFor(1500);
                    console.clear();
                    followingCount++;
                    console.log(` # Following [${chalk.blueBright(followingCount)}] from '${chalk.redBright(target)}'`);
                }
            }
        }

    } catch (error) {
        console.clear();
        console.log(` ${chalk.blueBright('@ Error during the process')}\n`);

        console.error(error);
    } finally {
        console.log('\n - Closing the Browser');
        await browser.close();
    }

})();