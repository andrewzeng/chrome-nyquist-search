var dict = {}, words = [];

function navigate(url) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.update(tabs[0].id, {url: url});
    });
}


chrome.omnibox.setDefaultSuggestion({description: "Search Nyquist docs for %s "});

chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
    var results = [];

    words.forEach(function (entry) {
        if ((entry.indexOf(text) == 0 || (entry.indexOf(text) == 1 && entry[0] == "*")) && results.length < 20) {
            results.push(entry);
        }
    });

    words.forEach(function (entry) {
        if (entry.indexOf(text) > -1 && results.length < 20 && results.indexOf(entry) == -1) {
            results.push(entry);
        }
    });

    if (results.length > 0) {
        results = results.map(function (name) {
            return {
                content: name,
                description: "Search Nyquist docs for " + name
            }
        });

        suggest(results);
    }

});

chrome.omnibox.onInputEntered.addListener(function (text) {
    if (text.length == 0) {
        navigate("http://www.cs.cmu.edu/~rbd/doc/nyquist/")
    } else {
        if (text in dict) {
            navigate("http://www.cs.cmu.edu/~rbd/doc/nyquist/" + dict[text]);
        } else {
            navigate("https://www.google.com/search?q=" + encodeURIComponent(text) + "+%22title+page%22+site%3Awww.cs.cmu.edu+inurl%3Arbd+inurl%3Adoc+inurl%3Anyquist&gws_rd=ssl")
        }


    }
});

function init() {

    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.status == 200 && request.readyState == 4) {
            var text = request.responseText;
            var strings = text.split('\n');
            var last = '';
            for (var i = 0; i < strings.length; i++) {
                if (strings[i].length == 0) {
                    break;
                }

                if (i % 2 == 0) {
                    last = strings[i].split(" ")[0];
                } else {
                    words.push(last);
                    dict[last] = strings[i];
                }
            }
        }
    };
    request.open("GET", "resources/NyquistWords.txt", true);
    request.send();
}

init();
