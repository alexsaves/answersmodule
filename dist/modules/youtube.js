/**
 * Module for embedding a youtube video
 */
define("youtube", function () {

    console.log("running youtube");

    var youtubenodes = document.querySelectorAll("*[role=youtube]");

    for (var i = 0; i < youtubenodes.length; i++) {
        var embednode = document.createElement("iframe");
        embednode.width = 640;
        embednode.height = 390;
        embednode.src = "//www.youtube.com/embed/" + youtubenodes[i].getAttribute("data");
        embednode.frameBorder = 0;
        embednode.allowFullScreen = true;
        //youtubenodes[i].appendChild(embednode);
    }

});