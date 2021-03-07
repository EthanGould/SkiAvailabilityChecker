const webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    LOGINURL = 'https://www.epicpass.com/account/login.aspx',
    BOOKINGURL = 'https://www.epicpass.com/plan-your-trip/lift-access/reservations.aspx',
    EMAIL = 'ethan.g.907@gmail',
    PW = 'Boomer2020!';

var accountSid = 'ACf4338e5374f2f4c678b96007495aeedd'; // Your Account SID from www.twilio.com/console
var authToken = '88747b47b1bc44719d1ce9ced767469a'; // Your Auth Token from www.twilio.com/console
var twilio = require('twilio');
var client = new twilio(accountSid, authToken);

const driver = new webdriver.Builder()
    .forBrowser('firefox')
    .build();

driver.get('https://www.epicpass.com/account/my-account.aspx').then(function() {
    driver.findElement(By.css('[data-user-authentication-status="logged out"]')).isDisplayed().then(function(loggedOut) {
        if (loggedOut) {
            login()
            .then(gotoBooking)
        }
    });
})


login = () => {
    return driver.get(LOGINURL).then(function () {
        let emailInput = driver.findElement(By.css('#txtUserName_3'));
        let pwInput = driver.findElement(By.css('#txtPassword_3'));
        let loginSubmit = driver.findElement(By.css('#returningCustomerForm_3 .accountLogin__cta'));

        emailInput.click();
        emailInput.sendKeys(EMAIL);
        pwInput.click();
        pwInput.sendKeys(PW);
        loginSubmit.click();
    });
}

viewResortCalendar = () => {
    driver.findElement(By.css('#PassHolderReservationComponent_Resort_Selection')).then(function (dropdown) {
            driver.executeScript("arguments[0].scrollIntoView(true); window.scrollBy(0, -window.innerHeight / 4);", dropdown);
            dropdown.click();
    }).then(function () {
        driver.findElement(By.css('option[value="85"]')).then(function (option) {
            option.click();
        }).then(function () {
            return driver.findElement(By.css('#passHolderReservationsSearchButton')).then(function (el) {
                el.click();
                driver.executeScript("window.scrollBy(0, window.innerHeight);");
            })
        });
    });
}

checkDesiredDates = () => {
    console.log('checking!');
    let message = '';
    
    setTimeout(() => {    
        driver.findElement(By.css('button.passholder_reservations__calendar__day:nth-child(12)')).isEnabled().then(function (fridayAvailable) {
            if (fridayAvailable) {
                message += 'Skiing spots open at Stowe on Friday March 12th ';
            }
        }).then(driver.findElement(By.css('button.passholder_reservations__calendar__day:nth-child(13)')).isEnabled().then(function(saturdayAvailable) {
            if (saturdayAvailable) {
                message += 'Skiing spots open at Stowe on Saturday March 13th ';
            }
        })).then(driver.findElement(By.css('button.passholder_reservations__calendar__day:nth-child(14)')).isEnabled().then(function (sundayAvailable) {
            if (sundayAvailable) {
                message += 'Skiing spots open at Stowe on Sunday March 14th ';
            }
        })).then(function() {
            if (message) { sendText(message) }
        });
    }, 2000);
}

sendText = (msg) => {
    console.log('sending to Twilio: ', msg);
    client.messages.create({
        body: `${msg}`,
        to: '+17817388261', // Text this number
        from: '+12513339287' // From a valid Twilio number
    })
    .then((message) => console.log(message.sid));
}

gotoBooking = () => {
    return driver.navigate().to(BOOKINGURL).then(function () {
           setTimeout(() => {
                driver.findElement(By.css('#onetrust-banner-sdk')).then(function(el) {
                    driver.executeScript("arguments[0].remove();", el);
                }).then(viewResortCalendar).then(checkDesiredDates)
           }, 5000);
    });
}
