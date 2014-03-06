/**
 * Module for embedding a webcollage powerpage
 */
define("webcollage", function () {

    console.log("running webcollage", AnswersML);

    var webcollagenodes = document.querySelectorAll("*[role=webcollage]");

    for (var i = 0; i < webcollagenodes.length; i++) {
        var nd = webcollagenodes[i],
            action = nd.getAttribute("action"),
            data = nd.getAttribute("data");

        switch (action) {
        case "powerpage":
            nd.innerHTML = "<h2>Put powerpage here: " + data + "</h2>";
            break;
        default:
            nd.innerHTML = "<h2>Put some content here: " + data + "</h2>";
            break;
        }



    }
});