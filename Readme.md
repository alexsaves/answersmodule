# Answers Sample Module Loader

This a possible approach for delivering a number of client-side products, and possible approaches for configuring those products.

This prototype uses the [AMD](http://en.wikipedia.org/wiki/Asynchronous_module_definition) pattern to define products and dependencies. Rather than rolling our code into a single (large) payload, we benefit from some degree of parallelism, and only retrieve the products we need on the pages we need them on.

## SPDY

We might seriously consider looking at SPDY (if we are not already) for our CDN. Going forward, this could provide significant benefits for getting these assets down to the client browser due to the streaming nature of the protocol. Right now SPDY support is hit and miss, but load-time improvements can be between 30% and 60%. [Some more information](http://www.webperformancetoday.com/tag/spdy/)

## Rollups vs Parralel loading

One question is, should we be combining and minifying all the payloads together, or loading them separately. A couple of points to be made here:

 * In ForeSee's case, we're doing a lot of rollups already, but we would actually benefit from splitting our larger files up into at least a couple smaller chunks due to parallelism.
 * By breaking the products up we can only load the things we need on the pages we need. Leveraging that and cacheing means you might never need to load everything at the same time, which is nice.
 * In the absense of protocols like SPDY, modern browsers are actually better at pulling things down in parallel like this.

Max concurrent connections by browser:

 * Firefox 4.x: 6 (ref missing)
 * Firefox 3.6.x: 6
 * Internet Explorer 9.x: 6
 * Internet Explorer 8.x: dialup: 2, broadband: 6
 * Internet Explorer 7.x: dialup: 2, broadband: 2
 * Chrome 11.x: 6
 * Chrome 10.x: 6
 * Opera 11.x: 8
 * Safari 5.x: 6 (ref missing)

## Limitations of this example

This isn't a polished product. One that that's glaringly missing from this demo is any `domready` governing. It's possible we'd run into some race conditions on some machines, particularly IE without this.

The point of this project to to illustrate an approach as a conversation piece.

## Building this project

Pull down the repo and install the dependencies (`sudo npm install`). Then you can build to the dist/ folder by running the default gulp task: `gulp`.

When the web server is running, point your browser at `http://localhost:3131/test.html`.

## Embedding the Gateway Script

For this example, the customer would embed the somewhat verbose asynchronous embed script, ideally in the header of the page:

    <script type="text/javascript">
        // PUT YOUR CONFIG HERE *************************

        AnswersConfig = {
            hasWebCollageHereOrSomethign: true
        };

        // DO NOT MODIFY BELOW THIS LINE *****************************************
        (function () {
            var d = document,
                    w = window,
                    am = d.createElement('script'),
                    aex = {
                        "src": "/answermodule.js",
                        "type": "text/javascript",
                        "async": "true",
                        "onload": am["onreadystatechange"] = function () {
                            var state = this["readyState"];
                            if (state && state != 'loaded' && state != 'complete')
                                return;
                            w["AnswersML"]["go"](w["AnswersConfig"]);
                        }
                    };
            for (var attr in aex) {
                am[attr] = aex[attr];
            }
            d.head.appendChild(am);
        })();
        // DO NOT MODIFY ABOVE THIS LINE *****************************************
    </script>

Notice what's going on here. At the top, we have a small configuration block, which is totally optional. This isn't the only way we can activate or turn on modules, but it was one use-case expressed by Eilon.

The rest of the code does the job of inserting an async script tag in a non-blocking and backwards compatible way.

## Contents of the /dist folder

In dist we have:

    test.html - A test harness demonstrating a couple different paradigms for embedding content and activating products.
    answermodule.js - The gateway script. This is the main script loaded by the page in all cases.
    modules/ - This folder contains the modules we're going to load.

## Customer-specific configuration

When the `answermodule.js` gets build, we assemble the `config/config.js` customer-specific configuration file. In this example, here's what it contains:

    /**
     * Customer-specific configuration file
     */
    AnswersProductWhitelist = {

        webcollage: {
            /**
             * Checks to see if this page has this product or not
             * @param config
             * @returns {boolean}
             */
            check: function(config) {
                return (!!config["hasWebCollageHereOrSomethign"]);
            }
        },

        youtube: {
            /**
             * Checks to see if this page has this product or not
             * @param config
             * @returns {boolean}
             */
            check: function(config) {
                return document.querySelectorAll('*[role=youtube]').length > 0;
            }
        },

        foreseecxreplay: {
            /**
             * In this case it just says it has it
             */
            check: true
        }
    };

This is a product whitelist, essentially. When `answermodule.js` is invoked, we look at each of these entries and evaluate whether we should include each product on this page.

We do this by way of a `check` attribute. In the first case we have a function:

    check: function(config) {
        return (!!config["hasWebCollageHereOrSomethign"]);
    }

The gateway script passes the config that was found on the page to the check function and we look at that to determine if Web Collage is needed on this page.

In the second example (youtube), we do a little bit of processing:

    check: function(config) {
        return document.querySelectorAll('*[role=youtube]').length > 0;
    }

We look for decorated HTML nodes on the page that have our special annotations. In this case, we're looking for tags that have the `role="youtube"` attribute. In `test.html` we have a node like this:

    <div role="youtube" data="ubGpDoyJvmI"></div>

It will notice this and return `true`. I'll talk more about this further down.

## Modules

The modules themselves are defined using the standard AMD definition:

    define(modulename, dependencies, factory);

So one of our examples, let's look at `foreseecxreplay`:

    /**
     * Module for handling foresee cxreplay
     */
    define("foreseecxreplay", ["foreseetrigger"], function (ForeSeeTrigger) {

        console.log("running foresee cxreplay yah", AnswersML, ForeSeeTrigger);

    });

It's pretty each to see what's going on here. The module `foreseecxreplay` depends on `foreseetrigger`. The module loader will resolve these dependencies before calling the factory.

## Looking at the demo

Without any optimizations, what you would see with this demo, if you looked at the network activity would be something like this:

![Unoptimized Network Traffic](https://raw.github.com/alexsaves/answersmodule/master/assets/timeline1.png)

Notice that all the modules are loaded in parallel except for `foreseetrigger.js`.