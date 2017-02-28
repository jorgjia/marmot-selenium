var mongoose = require('mongoose');
var webdriver = require('selenium-webdriver'), By = webdriver.By, until = webdriver.until;

var driver = new webdriver.Builder().forBrowser('firefox').build();

mongoose.connect("mongodb://thano:thano@ds163679.mlab.com:63679/marmot-db");
mongoose.connection.once('open', function() {console.log('Successfuly connected')});

var marmotSchema = new mongoose.Schema({
  "Target Group": String,
  "Material Group 1": String,
  "Material Group 2": String,
  "Style Number": String,
  "Style Name": String,
  "Size": String,
  "Color": String,
  "Color Number": String,
  "Style Number": String,
  "Quantity": String,
  "Retail": String,
  "Available": String,
  "UPC": String,
  "Image": String
});

var Marmot = mongoose.model("marmotdata", marmotSchema);
var styleNumber=[], color=[], extra, url;

Marmot.find({}, function(err, item) {
    if (err) console.log(err);
    else {
        for (var i = 0; i<item.length; i++) {
            styleNumber.push(item[i]['Style Number']);
            color.push(item[i]['Color']);
        }

        driver.get('http://marmot.com/men/');
        driver
        .wait(until.elementLocated(By.className('ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close')))
            .click().then(function(){
            Numeri(0);
        });

        function Numeri(i){
            driver.get('http://marmot.com/men/');
            driver.wait(until.elementLocated(By.id('q-1'))).sendKeys(styleNumber[i]).then(function() {
            driver.findElement(By.className('search-submit')).click()
            .then(function(){
                setTimeout(function() {

                    driver.findElement(By.className('primary-image'))
                    .getAttribute('src').then(
                        function(src){
                            driver.executeScript("\
                            var arr = $('img');\
                            for (var i = 0; i < arr.length; i += 1) {\
                                if ($(arr[i]).attr('alt') === '" + color[i] + "') $(arr[i]).click();\
                            }\
                            ").then(function() {
                                setTimeout(function() {
                                    driver.wait(until.elementLocated(By.className('product-image'))).getAttribute("innerHTML").then(function(data) {

                                    if (data.split("\"")[4] === " data-src-zoom=" || data.split("\"")[6] === " data-src-zoom=") console.log(data.split("\"")[5]);
                                    else var url = "-";

                                    Marmot.findOneAndUpdate({"Style Number": styleNumber[i]}, {"Image": url}, {new: true}, function(err, item) {
                                        if (err) console.log(err);
                                        else {
                                            console.log(styleNumber[i] + ": Updated.");
                                            console.log(color[i]);
                                            console.log(data);
                                            console.log("\n");

                                            i++;
                                            if (i<15) Numeri(i);
                                        }
                                    });
                                });
                            }, 4000);
                        });
                  },
                  function(err){
                     console.log('URL not found.');

                     Marmot.findOneAndUpdate({"Style Number": styleNumber[i]}, {"Image": "-"}, {new: true}, function(err, item) {
                         if (err) console.log(err);
                         else {
                             console.log(styleNumber[i] + ": Updated.");
                             console.log(color[i]);
                             console.log(data);
                             console.log("\n");

                             i++;
                             if (i<15) Numeri(i);
                         }
                     });
                  }
                )

             },5000);
            });
          });
    }
  }
});
