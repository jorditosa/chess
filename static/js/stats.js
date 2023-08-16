    function openTab(event, typeStatistic) {
        let i;
        let tabcontent;
        let tablinks;

        tabcontent = document.getElementsByClassName("tabcontent");
        tablinks = document.getElementsByClassName("tablinks");

        for(i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        for(i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }

        document.getElementById(typeStatistic).style.display = "block";
        event.currentTarget.className += " active";
    }
    function showRankingByTime() {
        var timeSelected = document.getElementById("timeSelect").value;
        displayRanking(timeSelected);
    }

    function displayRanking(timeKey) {
       var rankingDiv = document.getElementById("rankingByTime");
       rankingDiv.innerHTML = ""; // Limpiar la clasificación anterior

    users.sort((a, b) => b.puzzle10x[timeKey] - a.puzzle10x[timeKey]).forEach((user, index) => {
        var playerDiv = document.createElement("div");
        playerDiv.className = "player-ranking";

        var nameDiv = document.createElement("div");
        nameDiv.className = "player-name";
        nameDiv.innerHTML = (index + 1) + '. ' + user.username;

        var scoreDiv = document.createElement("div");
        scoreDiv.className = "player-score";
        scoreDiv.innerHTML = user.puzzle10x[timeKey];

        playerDiv.appendChild(nameDiv);
        playerDiv.appendChild(scoreDiv);
        rankingDiv.appendChild(playerDiv);
    });
}


    // Mostrar la clasificación de 3 minutos por defecto al cargar la página
    window.onload = function() {
        displayRanking('puzzle3min');
    }
