$().ready(main);

const theUrl = "https://olimshelper.herokuapp.com/";//api
let currentStep = 0;//steps
let stepColors= [
    "#00508c",
    "#35a000",
    "#c67a00",
    "#a00092",
    "#ba1a00",
    "#3a008c",
    "#d29600",
    "#ba002b",
    "#50008c"
];//colors for steps
let nowLanguage = "en";//current language, english by default
let lat = 0;
let lon = 0;
let map = null;
let places = [];

function main(){
    
    $('.scroll-back').click(function () {
        $('.sofa-horiz').animate({
            scrollLeft: '-=153'
        }, 1000, 'linear');
    });//scroll steps
    $('.scroll-forward').click(function () {
        $('.sofa-horiz').animate({
            scrollLeft: '+=153'
        }, 1000, 'linear');
    });//scroll steps
    $('.sofa-search').keypress(
        (e)=>{
            if(e.which==13&&$('.sofa-search').val()){
                // console.log("https://www.google.com/search?q="+$('.sofa-search').val());
                window.location.href = "https://www.google.com/search?q="+$('.sofa-search').val();
            }
        }//search which is located above in right corner
    )

    setDataByLang(nowLanguage);//set all info
    setLanguage();//set change language buttons clicks in right menu
    highlightLanguage(nowLanguage);//highlight choosen language
}

function setDataByLang(lang){
    let urlCurr = theUrl+lang;
    $.ajax({
        url: urlCurr
    }).then(function (data) {
        // console.log(data);
        let steps = data.steps;
        steps.sort((a,b)=>a.numberOfStep-b.numberOfStep);
        setSelectSteps(steps);
        setButtonClicks(steps)
        setInfo(steps,currentStep);
        setTitleText(lang);
        highlightLanguage(lang);
        fillMapWithPlaces(map,lang,currentStep,lat,lon,10);
    });
}

function setLanguage(){
    let qOfLang = $(".changeLang").length;
    for(var i=0; i<qOfLang; i++){
        // console.log( $(".changeLang")[i].getAttribute("id"));
        $(".changeLang")[i].onclick =
            function(){
                nowLanguage = this.getAttribute("id");
                setDataByLang(nowLanguage);
            };
    }
}

function setButtonClicks(steps){
    let theId = "item1";
    for(var i=0;i<9;i++){
        $("#item"+(i+1)).click(
            function(){
                theId = $(this).attr("id");
                currentStep=(+theId.substring(4,theId.length))-1;
                setColorHeaderInfo(currentStep);
                setInfo(steps,currentStep);
                fillMapWithPlaces(map,nowLanguage,currentStep,lat,lon,10);
            }
        );
    }
}

function setColorHeaderInfo(currentStep){
    $(".step-header").css("background-color",stepColors[currentStep]);
}

function setInfo(steps,numbStep){
    $(".step-head").text(steps[numbStep].title);
    $(".description-text").text(steps[numbStep].description);
    $(".step-need").text(steps[numbStep].need);
    $(".step-img").attr("src","images/step_0"+(numbStep+1)+".png");
}

function setSelectSteps(steps){
    for(var i=0;i<steps.length;i++){
        $("#item"+(i+1)+" > .choose-step").text(steps[i].title);
    }
}

function highlightLanguage(nowLanguage){
    // console.log(nowLanguage);
    let langs = $(".changeLang");
    for(var i=0; i< langs.length; i++){
        langs[i].style.color = "rgba(40,40,40,1)";
    }
    $(`#${nowLanguage}`).css("color", "#00508c");
}

function setTitleText(nowLanguage){
    let title = $(".title-text");
    switch(nowLanguage){
        case "en":
            title.text("10 STEPS OF A NEW REPRESENTATIVE");
            break;
        case "ru":
            title.text("10 ШАГОВ НОВОГО РЕПАТРИАНТА");
            break;
        case "he":
            title.text("שלבים של נציג חדש 10");
            break;
        case "fr":
            title.text("10 ÉTAPES D'UN NOUVEAU REPRÉSENTANT");
            break;
        default:
            title.text("10 STEPS OF A NEW REPRESENTATIVE");
            break;
    }
}

var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

//if succesided to get geolocation
function successMap(pos){
    lat = pos.coords.latitude;
    lon = pos.coords.longitude;
    var uluru = {lat: lat, lng: lon};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: uluru
    });
    var marker = new google.maps.Marker({
        position: uluru,
        map: map
    });
    fillMapWithPlaces(map,nowLanguage,currentStep,lat,lon,10);
}

//if geolocation error happened
function errorMap(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  };

$(window).on( 'resize',
  function(){
      google.maps.event.trigger( map, 'resize' );
  }
);

function clearMap(places){
    if(places.length>0){
        for(var i=0; i<places.length; i++){
            places[i].setMap(null);
        }
        places=[];
    }
}

function fillSofaAddresses(places){
    let descriptionHelp = $(".description-help");
    descriptionHelp.empty();
    if(places.length>0){
        for(var i=0; i<places.length; i++){
            let sofaAddress = document.createElement("div");
            sofaAddress.className = "sofa-address";
            descriptionHelp.append(sofaAddress);

            let imAddress = document.createElement("img");
            imAddress.className = "im-address";
            sofaAddress.append(imAddress);

            let addressInfo = document.createElement("div");
            addressInfo.className = "address-info";
            sofaAddress.append(addressInfo);

            let nameH5 = document.createElement("h5");
            nameH5.append(places[i].name);
            sofaAddress.append(nameH5);

            for(var j=0; j<places[i].phones.length; j++){
                let phoneP = document.createElement("p");
                phoneP.append(places[i].phones[j]);
                sofaAddress.append(phoneP);
            }

            for(var k=0;k<places[i].schedule.length; k++){
                let scheduleP = document.createElement("p");
                scheduleP.append(places[i].schedule[k]);
                sofaAddress.append(scheduleP);
            }

            let urlA = document.createElement("a");
            urlA.append(places[i].url);
            sofaAddress.append(urlA);
        }
    }
}

function fillMapWithPlaces(map,lang,step,lat,lon,rad){
    if(map!=null){
        // map.clearOverlays();
        let urlCurr = theUrl+`step/${lang}/${step+1}/area/${lat}/${lon}/${rad}`;
        $.ajax({
            url: urlCurr
        })
        // fetch(urlCurr)
        // .then(function (data) {
        //     console.log("places request successfull");
        //     return data.json;
        // })
        .then(function(placesArr){
           clearMap(places);
            if(placesArr.length!=0){
                for(var i=0;i<placesArr.length;i++){
                    var marker = new google.maps.Marker({
                        map: map,
                        place: {
                        placeId: placesArr[i].placeId,
                        location: { lat: placesArr[i].latitude, lng: placesArr[i].longitude}
                        }
                    });
                    places.push(marker);
                }
                fillSofaAddresses(placesArr);
            }
            else{
                let descriptionHelp = $(".description-help");
                descriptionHelp.empty();
                console.log("no places found");
            }
        });
    }
}

function initMap(){
    navigator.geolocation.getCurrentPosition(successMap, errorMap, options);
}