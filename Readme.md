# Answers Sample Module Loader

This a possible approach for delivering a number of client-side products, and possible approaches for configuring those products.

This prototype uses the [AMD](http://en.wikipedia.org/wiki/Asynchronous_module_definition) pattern to define products and dependencies. Rather than rolling our code into a single (large) payload, we benefit from some degree of parallelism, and only retrieve the products we need on the pages we need them on.

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

