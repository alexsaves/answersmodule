/**
 * Set up the Answers namespace
 */
window["AnswersML"] = AnswersML = (function () {

    // Keep a reference to whatever data we need to share
    var data = {};

    /**
     * Receive some configuration
     * @private
     */
    var begin = function (config) {
        data.config = config;

        // Loop over the config and test all the rules
        for (var prod in AnswersProductWhitelist) {
            if (AnswersProductWhitelist[prod].check === true || AnswersProductWhitelist[prod].check(config)) {
                answersRequire(prod);
            }
        }

    };

    /**
     * Export the interface
     */
    return {
        "go": begin,
        "data": data
    }
})();