# Answers Sample Module Loader

This a possible approach for delivering a number of client-side products, and possible approaches for configuring those products.

This prototype uses the [AMD](http://en.wikipedia.org/wiki/Asynchronous_module_definition) pattern to define products and dependencies. Rather than rolling our code into a single (large) payload, we benefit from some degree of parallelism, and only retrieve the products we need on the pages we need them on.

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

Notice what's going on here. At the top, we have a 