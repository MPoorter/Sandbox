(function () {
    'use strict';

    var song = {
        "youtubeID": "",
        "title": "",
        "lyrics": "",
        "version": 0,
        "dateAdded": null
    };

    $(document).ready(function () {
        getLatestSongs();
        $('#songButton').click(function () {
            var songURLVar = $('#songURL').val();
            song.youtubeID = findYoutubeVideoId(songURLVar);
            initVideoFrame();
            initSecondscreen();
        });


        $("#startPlayback").click(function () {
            if ($("#songTitle").val().length === 0 && $("#lyrics").val().length === 0) {
                alert("Please fill in title and lyrics");
            } else {
                $("#startPlayback").css({"display": "none"});
                console.log(song);
                sendSongToDatabase();
                startPlayback();
                initExerciseSection(1);
            }
        });
    });

    function initExerciseSection(difficultyLevel) {
        console.log("in init exercise section");
        var text = song.lyrics.replace(/\n/g, " <br/> ");
        var changedIntoInputs = [];
        text = addInputFields(text, difficultyLevel, changedIntoInputs);
        var div = document.createElement("div");
        var p = document.createElement("p");
        p.innerHTML = text;
        $(div).append(p);

        $("#lyrics").css({"display": "none"});
        $("#lyricsSection").append(div);
        changedIntoInputs.forEach(function (input) {
            $("#" + input.id + "").change(function () {
                var answer = $.trim($("#" + input.id + "").val()).toLowerCase();
                if (answer === input.answer.toLowerCase()) {
                    $("#" + input.id + "").css({"background-color": "lightgreen"});
                } else {
                    $("#" + input.id + "").css({"background-color": "white"});
                }
            });
        });

    }

    function addInputFields(text, difficultyLevel, changedIntoInputs) {
        var wordsArray = [];
        if (difficultyLevel === 1) {
            wordsArray = text.split(/\s/g);
            var interval = Math.ceil(Math.random() * 6) + 2;
            var i = Math.floor(Math.random() * 7);
            for (; i < wordsArray.length; i += interval) {
                if (wordsArray[i].length > 2 && wordsArray[i].match(/[a-zA-Z0-9Ά-ωΑ-ώ]{3}/gi) && !(wordsArray[i].includes("<br/>"))) {
                    var inputName = "input" + i;
                    var correctAnswer = wordsArray[i].replace(/,/g, "");
                    correctAnswer = correctAnswer.replace(/\./g, "");
                    changedIntoInputs.push({id: inputName, answer: $.trim(correctAnswer)});
                    wordsArray[i] = "<input id=\"" + inputName + "\" type=\"text\"/>";
                    interval = Math.ceil(Math.random() * 6) + 2;
                }
            }
        }
        return wordsArray.join(" ");
    }

    function initLatestSongs(data) {
        var listLatestSongs = document.createElement("ul");
        for (var id in data) {
            var li = document.createElement("li");
            li.setAttribute("id", id);
            li.setAttribute("name", data[id]);
            var a = document.createElement("a");
            a.innerHTML = data[id];
            li.append(a);
            listLatestSongs.append(li);
            li.addEventListener("click", function (e) {
                getSong(e.target.parentNode.getAttribute("id"));
                initVideoFrame();
                initSecondscreen();
                $("#songTitle").val(song.title);
                $("#lyrics").html(song.lyrics);
            })
        }
        $("#openingDiv > form").append(listLatestSongs);

    }

    function getLatestSongs() {
        $
            .ajax({
                async: true,
                type: "GET",
                url: "http://matthiasdepoorter.herokuapp.com/Greek/Song/Recent",
                contentType: "application/json",
                dataType: "json",
                success: function (data) {
                    initLatestSongs(data);
                }
            });
    }

    function getSong(id) {
        $
            .ajax({
                async: false,
                type: "GET",
                url: "http://matthiasdepoorter.herokuapp.com/Greek/Song/" + id,
                contentType: "application/json",
                dataType: "json",
                success: function (data) {
                    completeSongDataFromDatabase(data);
                }
            });
    }

    function initVideoFrame() {
        var songIFrame = document.createElement("iframe");
        songIFrame.setAttribute("id", "songIFrame");
        songIFrame.setAttribute("src", "https://www.youtube.com/embed/" + song.youtubeID);
        $(songIFrame).prependTo($("#videoSection"));
    }

    function initSecondscreen() {
        $("#openingDiv").css({"display": "none"});
        $("#videoSection").css({"display": "block"});
        $("#lyricsSection").slideDown("slow");
    }

    function completeSongDataFromForm() {
        song.title = $("#songTitle").val();
        song.lyrics = $("#lyrics").val();
        if (song.dateAdded === undefined || song.dateAdded === null) {
            song.dateAdded = new Date();
        }
    }

    function completeSongDataFromDatabase(data) {
        song.youtubeID = data.youtubeID;
        song.title = data.title;
        song.lyrics = data.lyrics;
        song.dateAdded = data.dateAdded;
        song.version = data.version;
    }

    function startPlayback() {
        $("#songIFrame").attr("src", $("#songIFrame").attr("src") + "?autoplay=1");
    }

    function sendSongToDatabase() {
        completeSongDataFromForm();
        $.ajax({
            async: true,
            type: "GET",
            url: "http://matthiasdepoorter.herokuapp.com/Greek/Song/" + song.youtubeID,
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                completeSongDataFromDatabase(data);
                completeSongDataFromForm();
                $.ajax({
                    async: true,
                    type: "PUT",
                    url: "http://matthiasdepoorter.herokuapp.com/Greek/Song/" + song.youtubeID,
                    data: JSON.stringify(song),
                    contentType: "application/json",
                    dataType: "json"
                });
            },
            error: function (status) {
                $.ajax({
                    async: true,
                    type: "POST",
                    url: "http://matthiasdepoorter.herokuapp.com/Greek/Song",
                    data: JSON.stringify(song),
                    contentType: "application/json",
                    dataType: "json"
                });
            }

        });

    }

    function findYoutubeVideoId(youtubeVideoURL) {
        var youtubeVideoId = "";
        var startCutOffPosition;
        if (youtubeVideoURL.indexOf("watch?v=") >= 0) {
            startCutOffPosition = youtubeVideoURL.indexOf("watch?v=") + 8;
            youtubeVideoId = youtubeVideoURL.slice(startCutOffPosition, startCutOffPosition + 11);
        } else if (youtubeVideoURL.indexOf("embed") >= 0) {
            youtubeVideoId = youtubeVideoURL.slice(youtubeVideoURL.length - 11);
        } else if (youtubeVideoURL.indexOf("youtu.") >= 0) {
            startCutOffPosition = youtubeVideoURL.indexOf("/", youtubeVideoURL.indexOf("youtu.") + 1);
            youtubeVideoId = youtubeVideoURL.slice(startCutOffPosition, startCutOffPosition + 11);
        }
        return youtubeVideoId;
    }


})();