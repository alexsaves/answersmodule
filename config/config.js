/**
 * Customer-specific configuration file
 */
AnswersProductWhitelist = {

    "webcollage": {
        /**
         * Checks to see if this page has this product or not
         * @param config
         * @returns {boolean}
         */
        check: function(config) {
            return (!!config["hasWebCollageHereOrSomethign"]);
        }
    },

    "youtube": {
        /**
         * Checks to see if this page has this product or not
         * @param config
         * @returns {boolean}
         */
        check: function(config) {
            return document.querySelectorAll('*[role=youtube]').length > 0;
        }
    },

    "foreseecxreplay": {
        /**
         * In this case it just says it has it
         */
        check: true
    }
};