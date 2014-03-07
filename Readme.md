# Answers Gateway Script Demo

This demonstrates two possible approaches for delivering a number of client-side products, and possible approaches for configuring those products.

This prototype uses the [AMD](http://en.wikipedia.org/wiki/Asynchronous_module_definition) pattern to define products and dependencies. It supports two use cases: parallel loading, and a monolith payload.

## Disclaimer

I'd like to emphasize, that these are only two possible approaches. There are other ways to do this, and we should be open to all of them at this early stage.

Also, **this isn't a polished product**. I've made some comprimises for the sake of being able to demonstrate both parallel loading and a monolith payload. One that that's glaringly missing from this demo is any `domready` governing. It's possible we'd run into some race conditions on some machines, particularly IE without this.

The point of this project to to illustrate a couple approaches as a conversation piece. Once we settle on an approach, or if we formally decide to do both, we would take the time to improve this system.


## Why AMD?

Until we truly have a unified JavaScript, we'll probably want to consider issues like scope isolation and interfaces. Our respective code bases may look very different, but AMD offers an industry standard way of packaging them without leaking all over each other - and forces us to define clear interfaces with each other.

Also, ForeSee started packaging their code as AMD modules a few months ago, due to several requests from customers. If we stick with this paradigm, irrespective of whether we roll all the code into a single file or not, we can have some flexibility in how we package it and give it to customers.

## Parallel AMD

In this case, rather than rolling our code into a single (large) payload, we benefit from some degree of parallelism, and only retrieve the products we need on the pages we need them on.

Here's the general architecture of the gateway script for this scenario:

![Overall Architecture](https://raw.github.com/alexsaves/answersmodule/master/assets/uber_arch1.png)

The individual modules below the gateway script are meant to be parallel requests. What isn't shown in this diagram is the resolution of interdependencies between these modules. Here is a workflow showing the basic flow:

![Workflow](https://raw.github.com/alexsaves/answersmodule/master/assets/uber_workflow1.png)

## Monolith AMD

In this case, we've kept the AMD pattern, but are rolling all the files into a single file. We still only execute the factories that apply to that configuration.

![Overall Architecture](https://raw.github.com/alexsaves/answersmodule/master/assets/monolith.png)

## Rollups vs parallel loading

One question is, should we be combining and minifying all the payloads together, or loading them separately. A couple of points to be made here:

 * In ForeSee's case, we're doing a lot of rollups already, but we would actually benefit from splitting our larger files up into at least a couple smaller chunks due to parallelism.
 * By breaking the products up we can only load the things we need on the pages we need. Leveraging that and cacheing means you might never need to load everything at the same time, which is nice.

Max concurrent connections **per hostname** by browser:

 * Firefox 3.6.x + : 6
 * Internet Explorer 9.x: 6
 * Internet Explorer 8.x: dialup: 2, broadband: 6
 * Internet Explorer 7.x: dialup: 2, broadband: 2
 * Chrome 11.x: 6
 * Chrome 10.x: 6
 * Opera 11.x: 8
 * Safari 5.x: 6

It's important to note these are **per-hostname** limits. They're set as much to protect web servers as they are to help surfers. Given these assets will all be coming from a specific hostname (separate from our customers), we can assume we'll have all of them.

### Advantages of Parallel AMD

 * Works better for several larger files
 * Allows for for loading only the products you need on the pages you need
 * Good optics of having "smaller files"

### Disadvantages of Parallel AMD

 * Works less well for many tiny files (unless you are using SPDY)
 * Bad optics of having "many requests"

Here's a performance comparison with large (jQuery Sized) and small (less than 1kb) files loaded with parallel and synchronous AMD. The vertical axis is in seconds of load-time:

![Performance Test AMD](https://raw.github.com/alexsaves/answersmodule/master/assets/comparison.png)

The benefits of parallelism increase with the size of the files involved.

## Building this project

You'll need NodeJS and `npm`. Pull down the repo and install the dependencies (`sudo npm install`). Then you can build one of the two examples using the appropriate gulp tasks:

 * `gulp parallel` - Build the parallel loading example.
 * `gulp monolith` - Build the single-file version.

When the web server is running, point your browser at `http://localhost:3131/test.html`.

## Contents of the /dist folder

In dist we have:

    test.html - A test harness demonstrating a couple different paradigms for embedding content and activating products.
    answermodule.js - The gateway script. This is the main script loaded by the page in all cases.
    modules/ - This folder contains the modules we're going to load.

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

## Parallel AMD Demo

Without any optimizations, what you would see with this demo, if you looked at the network activity would be something like this:

![Unoptimized Network Traffic](https://raw.github.com/alexsaves/answersmodule/master/assets/timeline1.png)

Even though the request for `foreseetrigger.js` occurs **after** `foreseecxreplay.js`, the dependency order is reverse. Fortunately, because of the require dependencies, the execution order is correct:

![Console output](https://raw.github.com/alexsaves/answersmodule/master/assets/console.png)

Notice that all the modules are loaded in parallel except for `foreseetrigger.js`. This is because the dependency for this file wasn't encountered until `foreseecxreplay.js` was retrieved. We can optimize this. By providing a prerequisite "hint" object we can pre-retrieve this file. In the demo, I do this by defining prerequisite hints inside `prereqs.js` which gets built into `answermodule.js`.

    /**
     * Helps us by preloading known dependencies. Saves time on first load, but not absolutely necessary
     */
    var preload_dependencies = {
        /**
         * ForeSee cxReplay requires foreseetrigger, let's say
         */
        "foreseecxreplay": ["foreseetrigger"]
    };

This is not required, but will speed up retrieval. This is a technique used by [RequireJS](https://github.com/jrburke/requirejs). Here's the new netstat:

![Optimized Network Traffic](https://raw.github.com/alexsaves/answersmodule/master/assets/timeline2.png)

## Monolith AMD Demo

With all the files rolled into one larger module, the network traffic looks like this.

![Monolith Network Traffic](https://raw.github.com/alexsaves/answersmodule/master/assets/monolithperf.png)

Looking at the console log, we see that the same dependencies are being honored.

![Monolith Console Log](https://raw.github.com/alexsaves/answersmodule/master/assets/deplogmonolith.png)

## Cacheing

In this example, the client is performing `HEAD` requests on the web server, to show clearly what is happening network-wise. In production we might set our cache headers to invoke more aggressive cacheing, by setting a proper expiry-date on these files. After the first page, these would be nearly instantaneous.

## SPDY

We might seriously consider looking at [SPDY](http://en.wikipedia.org/wiki/SPDY) (if we are not already) for our CDN. Going forward, this could provide significant benefits for getting these assets down to the client browser due to the streaming nature of the protocol. Right now SPDY support is hit and miss, but load-time improvements can be between 30% and 60%. [Some more information](http://www.webperformancetoday.com/tag/spdy/)
