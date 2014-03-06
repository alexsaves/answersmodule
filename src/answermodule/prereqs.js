/**
 * Helps us by preloading known dependencies. Saves time on first load, but not absolutely necessary
 * @type {{foreseecxreplay: string[]}}
 */
var preload_dependencies = {
    /**
     * ForeSee cxReplay requires foreseetrigger, let's say
     */
    "foreseecxreplay": ["foreseetrigger"]
};