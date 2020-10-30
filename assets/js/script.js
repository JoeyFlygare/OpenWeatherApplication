

var btnClick = false;


$("#searchCity").on("click", function () {
    btnClick = true;
    createWeatherData();
});
$("#history").on("click", function () {
    btnClick = true;
    createWeatherData();
});


function createWeatherData() {
    

    if (localStorage.length !== 0 && !$("#location").val() && !btnClick) {
        var userInput = localStorage.getItem(localStorage.length - 1);
    } else if (event.target.matches("button") || event.target.matches("i") && btnClick) {
        event.preventDefault();
        var userInput = $("#location").val().toLowerCase().trim();
    } else if (event.target.matches("li") && btnClick) {
        var userInput = event.target.getAttribute("cityData").toLowerCase().trim();;
    } else {
        return;
    }
   
    
    if (userInput === "") {
        return;
    }
    
    
    let localStorageBool = false;
    if (localStorage.length === 0) {
        localStorage.setItem(0, userInput);
        createSearchHistory();
        localStorageBool = true;
    } else {
        for (let i = 0; i < localStorage.length; i++) {
            if (localStorage.getItem(i) === userInput) {
                localStorageBool = true;
            }
        }
    }
    
    
    if (!localStorageBool) {
        localStorage.setItem(localStorage.length, userInput);
        createSearchHistory();
    }
   
     
    let APIKey = "ef8d3deaadba22efae141ac1cdaa4f1c";
    
    
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + userInput + "&appid=" +
        APIKey;
    
        
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        

        let currentDateUnix = response.dt;
        let currentDateMilliseconds = currentDateUnix * 1000;
        let currentDateConverted = new Date(currentDateMilliseconds).toLocaleDateString(
            "en-US");
        // get icon
        let currentWeatherIcon = response.weather[0].icon;
        

        let tempF = ((response.main.temp - 273.15) * 1.80 + 32).toFixed(1);
        
    
        let lat = response.coord.lat;
        let lon = response.coord.lon;
       

        $("#cityName").text(response.name + " (" + currentDateConverted + ")");
        $("#cityName")
            .append($("<img>").attr({
                src: "https://openweathermap.org/img/wn/" +
                    currentWeatherIcon +
                    "@2x.png",
                alt: "icon representation of weather conditions"
            }));
        $("#temp").text("Temperature: " +
            tempF + "\u00B0F");
        $("#humid").text("Humidity: " + response.main.humidity + "%");
       

        $("#windSpeed").text("Wind Speed: " + ((response.wind.speed) * 2.237).toFixed(1) +
            " MPH");
        
        let forecastQueryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat +
            "&lon=" + lon + "&exclude=current,minutely,hourly&appid=" + APIKey;
       

        $.ajax({
            url: forecastQueryURL,
            method: "GET"
        }).then(function (responseForecast) {
            
            $(".uvIndex").text("UV Index: " + responseForecast.daily[0].uvi);
            

            createUVIndexColor(responseForecast.daily[0].uvi);
            

            $(".forecast").empty();
           
            for (let i = 1; i < 6; i++) {
              
                $(".forecast-date-" + i).append(new Date(responseForecast.daily[i].dt *
                        1000)
                    .toLocaleDateString("en-US") + "<br>");
           
                $(".forecast-" + i).append($("<img>").attr({
                    src: "https://openweathermap.org/img/wn/" + responseForecast
                        .daily[i].weather[0].icon +
                        "@2x.png",
                    alt: "icon representation of weather conditions"
                }));
             
                $(".forecast-" + i).append("<br>Temp: " + ((responseForecast.daily[i].temp
                        .day - 273.15) *
                    1.80 + 32).toFixed(2) + " \u00B0F<br>");
           
                $(".forecast-" + i).append("Humidity: " + responseForecast.daily[i]
                    .humidity + "%<br>");
            }
        });
        console.log(response)
    });
   

    $("#location").val("");
}


function createUVIndexColor(x) {
    

    if (x >= 1.00 && x <= 2.99) {
        $("#uvBG").attr("style", "background-color:rgb(67, 185, 30);");
    } else if (x >= 3.00 && x <= 5.99) {
        $("#uvBG").attr("style", "background-color:rgb(252, 199, 33);");
    } else if (x >= 6.00 && x <= 7.99) {
        $("#uvBG").attr("style", "background-color:rgb(251, 116, 27);");
    } else if (x >= 8.00 && x <= 10.99) {
        $("#uvBG").attr("style", "background-color:rgb(248, 17, 22);");
    } else {
        $("#uvBG").attr("style", "background-color:rgb(134, 111, 255);");
    }
}


function createSearchHistory() {
    $("#history").empty();
    let newString = "";
    for (let i = 0; i < localStorage.length; i++) {
        

        newString = capLetters(localStorage.getItem(i));
        let cityLi = $("<li>");
        cityLi.attr("cityData", newString);
        cityLi.addClass("list-group-item");
        cityLi.text(newString);
        $("#history").append(cityLi);
    }
}


function capLetters(str) {
    let arrayStr = str.split(" ");
    let capLetter = "";
    let newString = "";
    for (let i = 0; i < arrayStr.length; i++) {
        capLetter = arrayStr[i][0].toUpperCase();
        newString += capLetter + arrayStr[i].slice(1, arrayStr[i].length) + " ";
    }
    return newString.trim();
}


if (localStorage.length !== 0) {
    createSearchHistory();
    createWeatherData();
}


$(document).ajaxError(function () {
    alert("Location not in database!");
    localStorage.removeItem(localStorage.length - 1);
    createSearchHistory();
});