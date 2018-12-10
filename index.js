/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This skill is designed to take echo devices into retail environments
 * The program is currently geared to boutiques and small-shop locations
 * Shopstar is geared toward in-store customer experience and can assist customers with:
 * finding available products, contacting associates, providing store-specific information and more.
 **/

'use strict';
const Alexa = require('alexa-sdk');
const alexaSDK = require('alexa-sdk');
const awsSDK = require('aws-sdk');
const { promisify } = require('util');

var Airtable = require('airtable');
Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: 'keyS9ewFNdCsJ6twh'
});
var base = Airtable.base('appIlxfc2mmc5REqt');

const APP_ID = `amzn1.ask.skill.52bff328-5eb4-4029-b483-ac0f7f4291fc`;
const SKILL_NAME = 'Shopstar';

 
 const HELP_MESSAGE = "";
 const HELP_REPROMPT = "";
 const STOP_MESSAGE = "Thank you for using Shop Star.";
 const CANCEL_MESSAGE = "Okay, I've cancelled that task.";

 const instructions = `<prosody rate="110%">Welcome to Shop Star<break strength="medium" /> 
                       To begin, you can say, help me find an item, i need store information, or call an associate.</prosody>`;
                       
const handlers = {
    'LaunchRequest': function () {
        this.attributes['clothingType'] = '';
        this.attributes['color'] = '';
        this.attributes['size'] = '';
        this.attributes['optionOne'] = 0;
        this.attributes['optionTwo'] = 0;
        this.attributes['c'] = 0;
        this.attributes['myOption'] = 0;

        this.response.speak(instructions).listen(`Please give me a request.`);
        this.emit(':responseReady');
    },
    'FindProductsIntent': function() {
        this.attributes['clothingType'] = '';
        this.attributes['color'] = '';
        this.attributes['size'] = '';
        this.attributes['optionOne'] = 0;
        this.attributes['optionTwo'] = 0;
        this.attributes['c'] = 0;
        this.attributes['myOption'] = 0;

        this.response.speak(`Okay, what kind of item are you looking for?`).listen(`Please tell me the type of item you're looking for.`);
        this.emit(':responseReady');
    },
    'GetProductTypeIntent': function () {
        this.attributes['clothingType'] = this.event.request.intent.slots.clothingType.value;
        this.response.speak(`How would you like to narrow your search?`).listen(`How would you like to narrow your search?
        I can search for size, brand, color, or no preference.`);
        this.emit(':responseReady');
    },
    'GetColorIntent': function () {
        if (!this.event.request.intent.slots.color.value) {
        	this.emit(':delegate');
      	} else {
            this.attributes['color'] = this.event.request.intent.slots.color.value;
            
            var speechOutput = `So you want a ` + this.attributes['color'] + ` ` + this.attributes['clothingType'] + `.
                <prosody rate="110%">If this is correct, say yes, that's right<break strength="medium" /> or, try a new search..</prosody>`;
            var repromptSpeech = `If this is correct, say yes, that's right<break strength="medium" /> or, try a new search.`;
            this.emit(':confirmIntent', speechOutput, repromptSpeech);
        }
    },
    'GetSizeIntent': function() {
        if (!this.event.request.intent.slots.size.value) {
        	this.emit(':delegate');
      	} else {
            this.attributes['size'] = this.event.request.intent.slots.size.value;
            
            var speechOutput = `So you want a ` +  this.attributes['clothingType'] + ` in a size ` + this.attributes['size'] + `.
                <prosody rate="110%">If this is correct, say yes that's right<break strength="medium" /> or try a new search..</prosody>`;
            var repromptSpeech = `If this is correct, say yes that's right<break strength="medium" /> or try a new search.`;
            this.emit(':confirmIntent', speechOutput, repromptSpeech);
        }
    },
    'AirtableSearchIntent': function () {
        var clothingType = this.attributes['clothingType'];
        var color = this.attributes['color'];
        var size = this.attributes['size'];
        var aBrand = this.attributes['brand'];
        this.attributes['c'] = 0;
        this.attributes['results'] = '';
        var that = this;
        
        var speechOutput = ``;
        var items = [
            //{"Brand":'brand', "Name":'name', "Price":0}
        ];
        var c = this.attributes['c'];

        base('Product Inventory').select({
            view: 'Demo View',
        }).firstPage(function(err, records) {
            if (err) { console.error(err); return; }
                records.forEach(function(record) {
                    if (color != '') {
                        if ((record.get('Color').includes(color)) && (record.get('Type').includes(clothingType.toLowerCase()))) {
                            if (c >= 3) {
                                speechOutput += '';                 
                            }
                            else {
                                c++;
                                // that.attributes['c']++;
                                var prodID = record.get('Product ID');
                                var brand = record.get('Brand');
                                var prodName = record.get('Product Name');
                                var price = record.get('Price');
                                items.push({"ID": prodID, "Brand": brand, "Name": prodName, "Price": price});
                            }
                        }     
                    }
                    else if (size != '') {
                        if ((record.get('Size').includes(size.toLowerCase())) && (record.get('Type').includes(clothingType.toLowerCase()))) {
                            if (c >= 3) {
                                speechOutput += '';                 
                            }
                            else if (c >= 1) {
                                if ((record.get('Brand') === items[items.length - 1].Brand) && (record.get('Product Name') === items[items.length - 1].Name)) {
                                    speechOutput += '';
                                }
                                else {
                                    c++;
                                    // that.attributes['c']++;
                                    var prodID = record.get('Product ID');
                                    var brand = record.get('Brand');
                                    var prodName = record.get('Product Name');
                                    var price = record.get('Price');
                                    items.push({"ID": prodID, "Brand": brand, "Name": prodName, "Price": price});
                                }
                            }
                            else {
                                c++;
                                // that.attributes['c']++;
                                var prodID = record.get('Product ID');
                                var brand = record.get('Brand');
                                var prodName = record.get('Product Name');
                                var price = record.get('Price');
                                items.push({"ID": prodID, "Brand": brand, "Name": prodName, "Price": price});
                            }
                        }     
                    }
                    else if (aBrand != '') {
                        if ((record.get('Brand Name').includes(aBrand.toLowerCase())) && (record.get('Type').includes(clothingType.toLowerCase()))) {
                            if (c >= 3) {
                                speechOutput += '';                 
                            }
                            else if (c >= 1) {
                                if ((record.get('Brand') === items[items.length - 1].Brand) && (record.get('Product Name') === items[items.length - 1].Name)) {
                                    speechOutput += '';
                                }
                                else {
                                    c++;
                                    // that.attributes['c']++;
                                    var prodID = record.get('Product ID');
                                    var brand = record.get('Brand');
                                    var prodName = record.get('Product Name');
                                    var price = record.get('Price');
                                    items.push({"ID": prodID, "Brand": brand, "Name": prodName, "Price": price});
                                }
                            }
                            else {
                                c++;
                                // that.attributes['c']++;
                                var prodID = record.get('Product ID');
                                var brand = record.get('Brand');
                                var prodName = record.get('Product Name');
                                var price = record.get('Price');
                                items.push({"ID": prodID, "Brand": brand, "Name": prodName, "Price": price});
                            }
                        }
                    }              
                });
            
            if (c === 0) {speechOutput += `<prosody rate="110%"> I couldn't find any good matches. 
                Would you like to try a new search or call an associate to come help you?</prosody>`};
            if (c > 0) {
                if (c === 1) {speechOutput += `<prosody rate="110%"> Okay, I found one match.</prosody>`};
                if (c === 2) {speechOutput += `<prosody rate="110%"> I found a couple matches that you might like.</prosody>`};
                if (c >= 3) {speechOutput += `<prosody rate="110%"> Here are the first three matches I found.</prosody>`};
                for(var j = 0; j < items.length; j++) {
                    if ((j === (c - 1)) && c > 1) {
                        speechOutput += (` and `);
                        that.attributes['results'] += (` and `);
                    }
                    speechOutput += (`<prosody rate="110%"> A ` + items[j].Brand + ` ` + items[j].Name + ` for $` + items[j].Price + `. </prosody>`);
                    that.attributes['results'] += (`<prosody rate="110%"> A ` + items[j].Brand + ` ` + items[j].Name + ` for $` + items[j].Price + `. </prosody>`);
                }
                speechOutput += `<prosody rate="110%"> Would you like to check product availability, try a new search or call an associate to you? </prosody>`; 
            }
        });

        setTimeout(myFunction, 2000);
        function myFunction () {
            that.attributes['c'] = c;
            if (c > 0) {
                that.attributes['optionOne'] = items[0].ID;
                // console.log('Option One: ' + that.attributes['optionOne']);
            }
            if (c > 1) {
                that.attributes['optionTwo'] = items[1].ID;
                // console.log('Option Two: ' + that.attributes['optionTwo']);
            }
            that.response.speak(speechOutput).listen(`I didn't catch that. 
                Would you like to check product availability, try a new search or call an associate for more assistance?`);
            that.emit(':responseReady');
        }       
    },

    'CheckAvailabilityIntent': function() {
        if (this.attributes['c'] > 1) {
            const speechOutput = '<prosody rate="110%"> Which product would you like to check? Option one or option two?</prosody>';
            const repromptSpeech = '<prosody rate="110%"> I may have misheard you. Say option one or option two or i can repeat the results if you need to hear them again.</prosody>';
            this.response.speak(speechOutput).listen(repromptSpeech);
            this.emit(':responseReady');

        }
        else {
            this.attributes['myOption'] = this.attributes['optionOne'];
            this.response.speak(`What would you like to check for?`).listen(`<prosody rate="110%">Sorry, I didn't catch that.
            You can say what colors are available, what sizes are available, or you can ask if it's available in a specific size?</prosody>`);        
            this.emit(':responseReady');
        }
    },

    'OptionIntent': function () {
        if (this.event.request.intent.slots.optionChoice.value === 'option 1') {
            this.attributes['myOption'] = this.attributes['optionOne'];
            this.response.speak(`Okay, what would you like to check for?`).listen(`<prosody rate="110%">Sorry, I didn't catch that.
            You can say what colors are available, what sizes are available, or you can ask if it's available in a specific size?</prosody>`);        
            this.emit(':responseReady');
        }
        else if (this.event.request.intent.slots.optionChoice.value === 'option 2') {
            this.attributes['myOption'] = this.attributes['optionTwo'];
            this.response.speak(`Okay, what would you like to check for?`).listen(`<prosody rate="110%">Sorry, I didn't catch that.
            You can say what colors are available, what sizes are available, or you can ask if it's available in a specific size?</prosody>`);        
            this.emit(':responseReady');
        }
        else {
            this.response.speak(`<prosody rate="110%">Woops, looks like I got a little carried away there and may or may not have forgotten what results I gave you.
            Would you like to try a new search or call an associate to assist you?</prosody>`).listen();        
            this.emit(':responseReady');
        }
    },

    'RepeatIntent': function () {
        this.response.speak(`Sure! I found ` + this.attributes['results'] + `. 
        Which would you like to check? Pick option one or option two.`).listen(`You have to say option one or option two.`);
        this.emit(':responseReady');
    },

    'WhatColorsIntent': function () {
        this.attributes['optionOne'] = '';
        this.attributes['optionTwo'] = '';
        var speechOutput = ``;
        var that = this;
        var avail = [

        ];
        var colors = [

        ];

        base('Product Inventory').select({
            view: 'Demo View',
        }).firstPage(function(err, records) {
            if (err) { console.error(err); return; }
                records.forEach(function(record) {
                if (record.get('Product ID') === that.attributes['myOption']) {
                    var brand = record.get('Brand');
                    var prodName = record.get('Product Name');
                    avail.push({"Brand": brand, "Name": prodName});
                }                  
            });
        });
        setTimeout(aFunction, 1000);
        function aFunction () {
            base('Product Inventory').select({
                view: 'Demo View',
            }).firstPage(function(err, records) {
                if (err) { console.error(err); return; }
                    records.forEach(function(record) {
                    if ((record.get('Brand') === avail[0].Brand) && (record.get('Product Name') === avail[0].Name)){
                        colors.push({"ID": record.get('Product ID'), "color": record.get('Color')[0]});
                        if (record.get('Product ID') === 18) {
                            that.attributes['optionOne'] = {"Brand": record.get('Brand'), "Name": record.get('Product Name'), "Color": record.get('Color')[0]};
                        }
                    }                   
                });
                speechOutput += `I have that ` + that.attributes['clothingType'] + ` in `;
                for(var j = 0; j < colors.length; j++) {
                    if (colors[j].ID < 18) {
                        speechOutput += (`only`);
                    }
                    else if (colors[j].ID === 19) {
                        speechOutput += (`and `);
                    }
                    
                    speechOutput += (`` + colors[j].color + `, `);
                }
                if (colors[0].ID >= 18) {
                    speechOutput += `If you like either of those, just say, I'll take the blank one, and I can call an associate to you.`;
                }
                if (colors[0].ID < 18) {
                    speechOutput += `If you like the options, I can call an associate to assist you.`
                }
            });
        }
        
        setTimeout(bFunction, 2000);
        function bFunction () {
            var cardTitle = `Card Title`;
            var cardContent = `Card Content`;
            that.response.cardRenderer(cardTitle, cardContent);
            that.response.speak(speechOutput).listen(`I can call an associate to further assist you, try a new search, or say Alexa stop to end the session.`);
            that.emit(':responseReady');
        }
    },

    'WhatSizesIntent': function () {
        this.attributes['optionOne'] = '';
        var speechOutput = ``;
        var that = this;
        var avail = [

        ];
        var sizes = [

        ];

        base('Product Inventory').select({
            view: 'Demo View',
        }).firstPage(function(err, records) {
            if (err) { console.error(err); return; }
                records.forEach(function(record) {
                if (record.get('Product ID') === that.attributes['myOption']) {
                    var brand = record.get('Brand');
                    var prodName = record.get('Product Name');
                    avail.push({"Brand": brand, "Name": prodName});
                }                  
            });
        });
        setTimeout(aFunction, 1000);
        function aFunction () {
            base('Product Inventory').select({
                view: 'Demo View',
            }).firstPage(function(err, records) {
                if (err) { console.error(err); return; }
                    records.forEach(function(record) {
                    if ((record.get('Brand') === avail[0].Brand) && (record.get('Product Name') === avail[0].Name)){
                        sizes.push({"ID": record.get('Product ID'), "size": record.get('Size')[0]});
                        that.attributes['optionTwo'] = {"Brand": record.get('Brand'), "Name": record.get('Product Name'), "Size": record.get('Size')[0]};
                    }                   
                });
                speechOutput += `I only have that ` + that.attributes['clothingType'] + ` in a size `;
                for(var j = 0; j < 1; j++) {            
                    speechOutput += (`` + sizes[j].size + ` `);
                }
                speechOutput += `right now. If you like that option, I can call an associate to assist you, or you can try a new search.`
            });
        }
        
        setTimeout(bFunction, 2000);
        function bFunction () {
        
            that.response.speak(speechOutput).listen(`I can call an associate to further assist you, try a new search, or say Alexa stop to end the session.`);
            that.emit(':responseReady');
        }
    },

    'GetMyItemIntent': function() {
        var option = this.attributes['optionOne'];
        console.log('Option: ' + this.attributes['optionOne']);
        var cardTitle = `Assistance Needed!`;
        var cardContent = `Product: ` + option.Brand + ` ` + option.Name + `\nColor: ` + option.Color;
        var cardImage = `http://bit.ly/2rpUg6Z`;
        this.response.cardRenderer(cardTitle, cardContent, cardImage);
        this.response.speak(`Okay great, I'm notifying Gina to assist you now. Thank you for shopping with Shopstar!`);
        this.emit(':responseReady'); 
    },

    'StoreInformationIntent': function() {
        this.response.speak(`Okay, would you like to know about store hours or current sales?`).listen();
        this.emit(':responseReady'); 
    },

    'StoreHoursIntent': function() {
        this.response.speak(`We are open Monday through Saturday from 10AM to 6PM, and from 12PM to 5PM on Sundays. Would you like to know more?`).listen();
        this.emit(':responseReady'); 
    },

    'SalesDisclaimerIntent': function() {
        this.response.speak(`<prosody rate="110%"> Quick disclaimer. All sales listed are for educational purposes only.
        If you'd still like to know more, just say, give me my deals </prosody>`).listen();
        this.emit(':responseReady'); 
    },

    'DealsIntent': function() {
        this.response.speak(`<prosody rate="105%"> Here are your deals. All Forever 21 items 15 percent off until December 31st <break strength="strong" />
        Grab One Get One Free Shop star stickers until the end of SLAM <break strength="strong" /> and lastly,  H and M products
        95 percent off due to my incompatible software with the ampersand in the brand name. <break strength="strong" />Happy Shopping! </prosody>`);
        this.emit(':responseReady'); 
    },

    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.YesIntent': function () {
        if (this.attributes['optionOne'] != '') {
            var option = this.attributes['optionTwo'];
            console.log('Option: ' + this.attributes['optionTwo']);
            var cardTitle = `Customer Needs Assistance!`;
            var cardContent = `Product: ` + option.Brand + ` ` + option.Name + `\nSize: ` + option.Size;
            var cardImage = `http://bit.ly/2rpUg6Z`;
        }
        this.response.cardRenderer(cardTitle, cardContent, cardImage);
        this.response.speak(`Okay, calling Gina now to come help you. Thank you for shopping with me. Goodbye`);
        this.emit(':responseReady');
    },
    'AMAZON.NoIntent': function () {
        this.response.speak(`Glad I could help! I hope you enjoyed shopping with me! Goodbye`);
        this.emit(':responseReady');
    },
};
exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = `amzn1.ask.skill.52bff328-5eb4-4029-b483-ac0f7f4291fc`;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
