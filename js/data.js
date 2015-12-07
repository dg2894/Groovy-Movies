        "use strict";
        var THEMOVIEDB_URL = "https://api.themoviedb.org/3/search/movie?api_key="
        var API_KEY = "883685de64b4c04801bcd597fc800e4a";
        var value;
        var url;

        window.onload = init;

        function init() {
            document.querySelector("#search").onclick = go;

            $(document).keypress(function (e) {

                if (e.which == 13) {
                    go();

                }
            });
        };

        function go() {
            getData();
            $("html, body").animate({
                scrollTop: (($(window).height()) + 10) + 'px'
            }, 600);
            $('#searchterm').val('');
            return false;
        }


        // MY FUNCTIONS
        function getData() {
            // build up our URL string
            url = THEMOVIEDB_URL;
            url += API_KEY;

            // get value of form field
            value = document.querySelector("#searchterm").value;

            // get rid of any leading and trailing spaces
            value = value.trim();

            // if there's no band to search then bail out of the function
            if (value.length < 1) return;

            document.querySelector("#dynamicContent").innerHTML = "<b>Searching for " + value + "</b>";

            // replace spaces the user typed in the middle of the term with %20
            // %20 is the hexadecimal value for a space
            value = encodeURI(value);

            // finally, add the artist name to the end of the string
            url += "&query=" + value;

            // call the web service, and download the file
            console.log("loading " + url);

            $("#content").fadeOut(1000);
            $.ajax({
                dataType: "jsonp",
                url: url,
                data: null,
                success: jsonLoaded
            });
        }

        function jsonLoaded(obj) {

            // if there's an error, print a message and return
            if (obj.error) {
                var status = obj.status;
                var description = obj.description;
                document.querySelector("#dynamicContent").innerHTML = "<h3><b>Error!</b></h3>" + "<p><i>" + status + "</i><p>" + "<p><i>" + description + "</i><p>";
                $("#dynamicContent").fadeIn(500);
                return; // Bail out
            }

            // if there are no results, print a message and return
            if (obj.results.length == 0) {
                var status = "No results found";
                document.querySelector("#dynamicContent").innerHTML = "<p><i>" + status + "</i><p>" + "<p><i>";
                $("#dynamicContent").fadeIn(500);
                return; // Bail out
            }

            var allMovies = obj.results;
            var bigString = "<p><b>There are " + allMovies.length + " movies for " + value + "</b></p>";

            for (var i = 0; i < allMovies.length; i++) {
                var initial = allMovies[i];

                var url = "https://api.themoviedb.org/3/movie/" + initial.id + "?api_key=" + API_KEY + "&append_to_response=credits";

                var config = "http://api.themoviedb.org/3/configuration?api_key=" + API_KEY;
                var requestConfig = new XMLHttpRequest();
                var base_url;
                var size;

                requestConfig.open('GET', config);

                requestConfig.onreadystatechange = function () {
                    if (this.readyState === 4) {
                        var configData = JSON.parse(this.responseText);
                        //console.log(JSON.stringify(configData));
                        base_url = configData.images.base_url;
                        size = configData.images.poster_sizes[3];
                    }
                };

                requestConfig.send();

                var request = new XMLHttpRequest();

                request.open('GET', url);

                request.onreadystatechange = function () {
                    if (this.readyState === 4) {
                        var movieData = JSON.parse(this.responseText);
                        //console.log(JSON.stringify(movieData));

                        /*movie div*/

                        var movieDiv = document.createElement('div');
                        movieDiv.className = "movieDiv";

                        /*left div*/

                        var left = document.createElement('div');
                        left.id = "left";
                        var title = document.createElement('h3');
                        title.innerHTML = movieData.original_title;
                        left.appendChild(title);

                        if (movieData.poster_path == null) {
                            var src = "../media/action.png";
                        } else {
                            var src = base_url + size + "/" + movieData.poster_path;
                        }

                        left.innerHTML += "<img class='poster' src='" + src + "'/>";

                        movieDiv.appendChild(left);

                        /*right div*/

                        var right = document.createElement('div');
                        right.id = "right";
                        var overview = document.createElement('p');
                        overview.className = "description";

                        if (movieData.overview == null) {
                            overview.innerHTML = "No description found."
                        } else {
                            overview.innerHTML = movieData.overview;
                        }

                        right.appendChild(overview);

                        var castDiv = document.createElement("div");
                        castDiv.className = "cast";
                        var castString = document.createElement("p");
                        castString.innerHTML = "Starring: ";
                        for (var i = 0; i < movieData.credits.cast.length; i++) {
                            castString.innerHTML += movieData.credits.cast[i].name + ", ";
                        }
                        castDiv.appendChild(castString);
                        right.appendChild(castDiv);

                        var button = document.createElement("button");
                        button.innerHTML = "Read More"
                        button.id = movieData.id;
                        button.className = "read-more-button";
                        button.addEventListener('click', function () {
                            totalVotes.style.visibility = "visible";
                            readMore(movieData, svg);
                        });

                        right.appendChild(button);

                        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                        svg.setAttribute('id', "rating-" + movieData.id);
                        svg.setAttribute('width', '100px');
                        svg.setAttribute('height', '100px');
                        svg.setAttribute('display', 'block');
                        svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
                        right.appendChild(svg);

                        var totalVotes = document.createElement("p");
                        totalVotes.innerHTML = "Out of: " + movieData.vote_count + " total votes";
                        totalVotes.style.visibility = "hidden";
                        right.appendChild(totalVotes);

                        movieDiv.appendChild(right);
                        var clear = document.createElement("div");
                        clear.style.clear = "both";
                        movieDiv.appendChild(clear);

                        document.querySelector('#dynamicContent').appendChild(movieDiv);
                    }
                };

                request.send();

            }

            $("#dynamicContent").fadeIn(500);
        }

        function readMore(obj, svg) {
            var config1 = liquidFillGaugeDefaultSettings();
            config1.circleColor = "#7ac1c4";
            config1.textColor = "#49adb1";
            config1.waveTextColor = "#6dafb2";
            config1.waveColor = "#b5d6d8";
            config1.circleThickness = 0.2;
            config1.waveAnimateTime = 1000;
            var gauge2 = loadLiquidFillGauge(svg.id, obj.vote_average, config1);
        }