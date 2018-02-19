$().ready(main);

let zoomValue = 1;
const theUrl = "https://olimshelper.herokuapp.com/";//api
const MIN_KM=1;
const MAX_KM = 10;
const INC = 1;
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
let lat = 0;//latitude
let lon = 0;//longitude
let map = null;//google maps
let myMarker = null;//the marker which shows your location
let markers = [];//markers on map
let bounds = null;

let icons = [
    "images/mk_grey.png",
    "images/mk_step_01.png",
    "images/mk_step_02.png",
    "images/mk_step_03.png",
    "images/mk_step_04.png",
    "images/mk_step_05.png",
    "images/mk_step_06.png",
    "images/mk_step_07.png",
    "images/mk_step_08.png",
    "images/mk_step_09.png",
    "images/ic_my_location.png"
];//icons for markers
let geocoder;//with this you decode placeId to get more information
let closeBtnText = {
    en: "CLOSE",
    ru: "ЗАКРЫТЬ",
    he: "לסגור",
    fr: "FERMER"
};
let showRouteBtnText = {
    en: "SHOW ROUTE",
    ru: "ПОКАЗАТЬ ПУТЬ",
    he: "להראות את הדרך",
    fr: "MONTRER LE CHEMIN"
};
let goToTheSiteBtnText = {
    en: "GO TO THE SITE",
    ru: "ПЕРЕЙТИ К САЙТУ",
    he: "עבור אל האתר",
    fr: "ALLER AU SITE"
};
let phonesText = {
    en: "PHONES",
    ru: "ТЕЛЕФОНЫ",
    he: "טלפונים",
    fr: "TELEPHONES"
};
let scheduleText = {
    en: "SCHEDULE",
    ru: "РАСПИСАНИЕ",
    he: "לוח זמנים",
    fr: "HORAIRE"
};
let myLocationText={
    en: "my location",
    ru: "мое расположение",
    he: "המיקום שלי",
    fr: "mon emplacement"
};
let weekDay ={ 
    en:[
        "sun","mon","tue","wed","thu","fri","sat"
    ],
    ru:[
        "вск","пон","втр","срд","чтв","птн","сбт"
    ],
    he:[
        "א", "ב","ג","ד","ה","ו","ש"
    ],
    fr:[
        "dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"
    ],
};//this will be required when you look info about marker
let fullLangName = {
    en: "English",
    ru: "Russian",
    he: "Hebrew",
    fr: "French"
}
//options for google maps
var options = {
    enableHighAccuracy: true,
    // timeout: 5000,
    maximumAge: 0
};
let cityList = [];//the list of cities which will appear when geolocation is locked
let currentCity;
let showTheInfo = false;

function main(){//intialise everything
    setClicksPlusMinusText();
    $('.scroll-back').click(function () {
        $('.sofa-horiz').animate({
            scrollLeft: '-=271'
        }, 500, 'linear');
    });//scroll steps back
    $('.scroll-forward').click(function () {
        $('.sofa-horiz').animate({
            scrollLeft: '+=271'
        }, 500, 'linear');
    });//scroll steps forward
    $('.sofa-search').keypress(
        (e)=>{
            if(e.which==13&&$('.sofa-search').val()){
                // console.log("https://www.google.com/search?q="+$('.sofa-search').val());
                window.location.href = "https://www.google.com/search?q="+$('.sofa-search').val();//google search
            }
        }//search which is located above in right corner
    )
    toggleShowInfo(showTheInfo);
    setInfoHeight();
    setDataByLang(nowLanguage);//set all info
    setLanguage();//set change language buttons clicks in right menu
    highlightLanguage(nowLanguage);//highlight choosen language
    // prepareLocationList();
    setLocationList();
    // setGoToMinesterySiteBtn();
    setInfoBtnClick()
}

function setInfoBtnClick(){
    $(".info-head").click(
        function(){
            showTheInfo = !showTheInfo;
            toggleShowInfo(showTheInfo);
        }
    )
}

function toggleShowInfo(toShow){
    if(toShow){
        $(".info-of-step").show();
        $(".description-help").hide();
        $(".info-of-marker").hide();
        
    }
    else{
        $(".info-of-step").hide();
        $(".description-help").show();
        $(".info-of-marker").show();
    }
}

function setGoToMinesterySiteBtn(){
    $("#go-to-minestery-site").click(
        function(){
            window.open(`http://www.moia.gov.il/${fullLangName[nowLanguage]}`,`_blank`);
        }
    )
}

function setInfoHeight(){
    if(window.innerWidth>767){
        $(".step-description").css(
            "grid-template-rows",
            (window.innerHeight-document.getElementsByClassName("step-description")[0].getBoundingClientRect().y-10)+"px");
            $(".sofa-map").css(
                "height",
                (window.innerHeight-document.getElementsByClassName("sofa-map")[0].getBoundingClientRect().y-10)+"px");
    }
}

function setClicksPlusMinusText(){
    $("#plus-text").click(
        function(){
            zoomInText();
        }
    );
    $("#minus-text").click(
        function(){
            zoomOutText();
        }
    );
}

function zoomInText(){
    zoomValue+=0.1;
    $(".info-of-step").css("font-size",zoomValue+"em");
}

function zoomOutText(){
    zoomValue-=0.1;
    $(".info-of-step").css("font-size",zoomValue+"em");
}

function showLoading(){
    $(".loading-window").show(0);
}

function hideLoading(){
    $(".loading-window").hide(100);
}

function setRightTextAlign(){
    $(".info-of-step").css("text-align","right");
    // $(".menu-item p").css("text-align","right");
    
}

function setLeftTextAlign(){
    $(".info-of-step").css("text-align","left");
    // $(".menu-item p").css("text-align","left");
}

//set all info
function setDataByLang(lang){
    showLoading();
    $(".div-to-remove").remove();
    let urlCurr = theUrl+lang;//url to get info by language
    $.ajax({
        url: urlCurr
    }).then(function (data) {
        lang=="he"?setRightTextAlign():setLeftTextAlign();
        let steps = data.steps;//get info about steps
        steps.sort((a,b)=>a.numberOfStep-b.numberOfStep);//sort the array of objects, because steps are not in the right order
        setSelectSteps(steps);//set text for menu where you choose step
        setButtonClicks(steps)//set clicks in this menu according to the info you got
        setInfo(steps,currentStep);//set the info about the step
        setTitleText(lang);//set new title according to language you chose
        highlightLanguage(lang);//highlight the chosen language
        fillMapWithPlaces(map,lang,currentStep,lat,lon,MIN_KM,MAX_KM,INC);//fill the map with markers
        if(map)
        hideLoading();
    });
}

//set clicks for change language buttons
function setLanguage(){
    let qOfLang = $(".changeLang").length;//get the quantity of languages
    for(var i=0; i<qOfLang; i++){
        $(".changeLang")[i].onclick =
            function(){
                nowLanguage = this.getAttribute("id");//set the nowLanguage global variable
                setDataByLang(nowLanguage);//set the data according to langugage you chose
                setLocationList();
            };
    }
}



//set clicks in this menu according to the info you got
function setButtonClicks(steps){
    let theId = "item1";//this will be needed to get the value of new step, because every button ti change step contains the number of step
    for(var i=0;i<9;i++){
        $("#item"+(i+1)).click(//when button to change step clicked
            function(){
                $(".description-help").css("grid-column","1/3");
                $(".div-to-remove").remove();
                theId = $(this).attr("id");//get the id of the clicked button
                currentStep=(+theId.substring(4,theId.length))-1;//change the value of current step
                setColorHeaderInfo(currentStep);//set color for header of info according to chosen step
                setInfo(steps,currentStep);//set the info according to the step
                fillMapWithPlaces(map,nowLanguage,currentStep,lat,lon,MIN_KM,MAX_KM,INC);//fill the map with markers according to the step
            }
        );
    }
}

//set the color of header of info of step according to chosen step
function setColorHeaderInfo(currentStep){
    $(".step-header").css("background-color",stepColors[currentStep]);
}

//set the info according to step
function setInfo(steps,numbStep){
    $(".step-head").text(steps[numbStep].title);
    $(".description-text").text(steps[numbStep].description);
    $(".step-need").text(steps[numbStep].need);
    $(".step-img").attr("src","images/step_0"+(numbStep+1)+".png");
}

//set the names of steps according to current language
function setSelectSteps(steps){
    for(var i=0;i<steps.length;i++){
        $("#item"+(i+1)+" > .choose-step").text(steps[i].title);
    }
}

//highlight the chosen language
function highlightLanguage(nowLanguage){
    let langs = $(".changeLang");
    for(var i=0; i< langs.length; i++){
        langs[i].style.color = "rgba(110,110,110,1)";
    }
    $(`#${nowLanguage}`).css("color", "#00508c");
}

//set the site title to name according to language
function setTitleText(nowLanguage){
    let title = $(".title-text");
    switch(nowLanguage){
        case "en":
            title.text("10 STEPS OF A NEW REPATRIATE");
            break;
        case "ru":
            title.text("10 ШАГОВ НОВОГО РЕПАТРИАНТА");
            break;
        case "he":
            title.text("עשר שלבים של עולה חדש");
            break;
        case "fr":
            title.text("10 ÉTAPES D'UN NOUVEAU RAPATRIANT");
            break;
        default:
            title.text("10 STEPS OF A NEW REPATRIATE");
            break;
    }
}

function changePosition(lat,lon){
    myMarker.setPosition({lat:lat,lng:lon});
    map.setCenter({lat:lat,lng:lon});
    fillMapWithPlaces(map,nowLanguage,currentStep,lat,lon,MIN_KM,MAX_KM,INC);
}

function setMap(lat,lon){
    map = null;
    var icon = {
        url: icons[10], // url
        scaledSize: new google.maps.Size(20, 20), // scaled size
        origin: new google.maps.Point(0,0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
    };//set icon for my position
    var uluru = {lat: lat, lng: lon};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: uluru,
        mapTypeControl: false
    });//create map
    myMarker = new google.maps.Marker({
        position: uluru,
        map: map,
        icon: icon,
        zIndex: 2
    });//put marker
    fillMapWithPlaces(map,nowLanguage,currentStep,lat,lon,MIN_KM,MAX_KM,INC);//fill the map with markers
}

//if succesided to get geolocation
function successMap(pos){
    currentCity = "0";
    lat = pos.coords.latitude;
    lon = pos.coords.longitude;
    setMap(lat,lon);
    
}

function setLocationList(){
    let urlCurr = theUrl + `${nowLanguage}/city`;
    $.ajax({
        url: urlCurr
    })
    .then(
        (data)=>{
            cityList = data;
            $(".hold-list-div").remove();
            let holdListDiv = document.createElement("div");
            holdListDiv.className = "hold-list-div";
            $(".hold-search").append(holdListDiv);

            let controlListDiv = document.createElement("div");
            controlListDiv.className = "control-list-div";
            holdListDiv.appendChild(controlListDiv);

            let currentCityIndex = 0;
            let listOfCitiesSelect = document.createElement("select");
            listOfCitiesSelect.className = "the-list";

            let cityOption = document.createElement("option");
            cityOption.name = myLocationText[nowLanguage];
            cityOption.innerHTML = myLocationText[nowLanguage];
            cityOption.value = "0";
            listOfCitiesSelect.appendChild(cityOption);
            for(let i=0; i< cityList.length; i++){
                let strCoords = cityList[i].latitude+"|"+cityList[i].longitude;
                if(strCoords==currentCity){
                    currentCityIndex = i;
                }
                let cityOption = document.createElement("option");
                cityOption.name = cityList[i].name;
                cityOption.innerHTML = cityList[i].name;
                cityOption.value = strCoords;
                listOfCitiesSelect.appendChild(cityOption);
            }
            
            listOfCitiesSelect.onchange = function(){
                let theCurrentCity = listOfCitiesSelect.value;
                if( theCurrentCity!="0"){
                // currentCity = listOfCitiesSelect.value;
                    currentCity = theCurrentCity;
                    let coords = currentCity.split("|");
                    lat = +coords[0];
                    lon = +coords[1];
                    changePosition(lat, lon);
                }
                else{
                    navigator.geolocation.getCurrentPosition(successMap, errorMap, options);//get location
                }
            }
            controlListDiv.appendChild(listOfCitiesSelect);
            if(currentCityIndex){
                listOfCitiesSelect.value = cityList[currentCityIndex].latitude+"|"+cityList[currentCityIndex].longitude;
            }else{
                listOfCitiesSelect.value = "0";
            }
            // holdListDiv.index = 1;
            // map.controls[google.maps.ControlPosition.TOP_CENTER].push(holdListDiv);
        }
    );
}

//if geolocation error happened
function errorMap(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
    // $(".step-description").css("grid-template-columns", "1fr");
    // $(".the-info").css("grid-template-columns","1fr");
    if(!currentCity){
        let urlCurr = theUrl + `${nowLanguage}/city`;
        $.ajax({
            url: urlCurr
        })
        .then(
            (data)=>{
                cityList = data;
                let TelAviv = null;
                TelAviv = data.find(
                    (city)=>{
                        if(city.name=="Tel Aviv"||city.name == "תל אביב"||city.name=="Тель-Авив"){
                            return city;
                        }
                    }
                );
                currentCity = TelAviv.latitude+"|"+TelAviv.longitude;
                lat = TelAviv.latitude;
                lon = TelAviv.longitude;
                setMap(lat,lon);
                document.getElementsByClassName("the-list")[0].value = currentCity;
                hideLoading();
            }
        );
    }
    else{
        document.getElementsByClassName("the-list")[0].value = currentCity;
        hideLoading();
    }
};

$(window).on( 'resize',
  function(){
      google.maps.event.trigger( map, 'resize' );
  }
);//resize the map

function clearMap(){//clear markers
    if(markers.length>0){
        for(var i=0; i<markers.length; i++){
            markers[i].setMap(null);
        }
        markers=[];
    }
}

function highlightMarker(n){//highlight the chosen marker
    for(let i=0; i<markers.length;i++){
        if(i!=n){//if it is not our marker
            var icon = {
                url: icons[0], // url
                scaledSize: new google.maps.Size(20, 30), // scaled size
                origin: new google.maps.Point(0,0), // origin
                anchor: new google.maps.Point(0, 0) // anchor
            };//new icon(grey one)
            markers[i].setIcon(icon);//set the grey icon
        }
        else{
            markers[i].setZIndex(1);
        }
    }
}

function unhighlightMarkers(){//unhilight all markers
    for(let i=0; i<markers.length;i++){
        var icon = {
            url: icons[currentStep+1], // url
            scaledSize: new google.maps.Size(20, 30), // scaled size
            origin: new google.maps.Point(0,0), // origin
            anchor: new google.maps.Point(0, 0) // anchor
        };//the icon according to current step
        markers[i].setIcon(icon);//set the icon
        markers[i].setZIndex(0);
    }
}

//event when marker was clicked
function onAddressClick(sofaAddress,markerNumber,place){
    // $(".sofa-address").hide(0);//hide all markers
    $(".description-help").css("grid-column","1");
    $(".div-to-remove").remove();
    highlightMarker(markerNumber);//highlight the chosen marker on the map
    let infoOfMarker = $(".info-of-marker");//get the marker container
    let divToRemove =document.createElement("div");//create the element where the information about marker would be put, so that it could easily be removed without deleting data about all markers
    divToRemove.className = "div-to-remove";
    infoOfMarker.append(divToRemove);

    let divWrap = document.createElement("div");//create wrapper
     divToRemove.appendChild(divWrap);

    let markerInfo = document.createElement("div");//create a button to close the info about current marker
    divWrap.appendChild(markerInfo);
    let closeBtn = document.createElement("button");
    closeBtn.innerText = closeBtnText[nowLanguage];
    closeBtn.className = "marker-btn";
    closeBtn.onclick = function(){
        closeCurrentMarker();
        $(".description-help").css("grid-column","1/3");
    }
    markerInfo.appendChild(closeBtn);

    markerInfo = document.createElement("div");//create a button to close the info about current marker
    divWrap.appendChild(markerInfo);
    let showBtn = document.createElement("button");
    showBtn.innerText = showRouteBtnText[nowLanguage];
    showBtn.className = "marker-btn";
    // console.log(`https://www.google.com/maps/dir/?api=1&origin=${myMarker.getPosition().lat()},${myMarker.getPosition().lng()}&destination=${place.latitude},${place.longitude}`);
    showBtn.onclick = function(){
        window.open(`https://www.google.com/maps/dir/?api=1&origin=${myMarker.getPosition().lat()},${myMarker.getPosition().lng()}&destination=${place.latitude},${place.longitude}`,`_blank`);
    }
    markerInfo.appendChild(showBtn);

    markerInfo = document.createElement("div");//create wrapper which sometimes would be a grid or not depending on the className
    markerInfo.className = "div-to-make-flex-work";
    divWrap.appendChild(markerInfo);
    let nameH5 = document.createElement("h5");//put the name of the marker
    nameH5.innerText = place.name;
    nameH5.className = "make-flex";
    markerInfo.appendChild(nameH5);

    let phoneH6 = document.createElement("h6");//put the name of the marker
    phoneH6.innerText = phonesText[nowLanguage]+ ":";
    divWrap.appendChild(phoneH6);

    for(var j=0; j<place.phones.length; j++){//put the phone numbers of current marker
        markerInfo = document.createElement("div");
        markerInfo.className = "div-to-make-flex-work";
        divWrap.appendChild(markerInfo);
        let phoneP = document.createElement("p");
        phoneP.className = "make-flex";
        phoneP.innerText = place.phones[j];
        markerInfo.appendChild(phoneP);
    }

    let scheduleH6 = document.createElement("h6");//put the name of the marker
    scheduleH6.innerText = scheduleText[nowLanguage]+ ":";
    divWrap.appendChild(scheduleH6);

    for(var k=0; k<7;k++){//put the schedule of current marker
        markerInfo = document.createElement("div");
        markerInfo.className = "marker-info";
        divWrap.appendChild(markerInfo);
        let scheduleP = document.createElement("p");
        scheduleP.className = "make-flex";
        let strDay = place.schedule[k];
        let nameWeek = document.createElement("p");
        nameWeek.className = "make-flex";
        nameWeek.innerText = weekDay[nowLanguage][k];
        scheduleP.innerText = strDay;
        markerInfo.appendChild(nameWeek);
        markerInfo.appendChild(scheduleP);
    }


    markerInfo = document.createElement("div");//create a button to go to the website of current marker
    divWrap.appendChild(markerInfo);
    let urlBtn = document.createElement("button");
    urlBtn.innerText = goToTheSiteBtnText[nowLanguage];
    urlBtn.className = "marker-btn";
    urlBtn.onclick = function(){
        window.open("http://"+place.url,"_blank");
    }
    markerInfo.appendChild(urlBtn);

    

}

function closeCurrentMarker(){//close the clicked marker
    unhighlightMarkers();
    $(".div-to-remove").remove();//remove all previous data about the marker
    $(".sofa-address").show(0);//show all markers
}

//fill the list of markers
function fillSofaAddresses(places){
    let descriptionHelp = $(".description-help");//get the container of markers
    descriptionHelp.empty();//empty it from previous markers
    if(places.length>0){//if there are any places
        for(let i=0; i<places.length; i++){
            let sofaAddress = document.createElement("div");//create the div which contains some information about the marker
            sofaAddress.className = "sofa-address pointable marker"+i;//set the class name for it to set styles from css
            descriptionHelp.append(sofaAddress);//appendChild it to element where it should be contained
            sofaAddress.onclick = ()=> onAddressClick(sofaAddress,i,places[i]);// set the click event. when it clicked the more information appears

            //the logic of adding following elements is pretty much the same

            // let imAddress = document.createElement("img");//add the container for image
            // //it wont probably be needed
            // imAddress.className = "im-address";
            // sofaAddress.appendChild(imAddress);

            // let addressInfo = document.createElement("div");//add the 
            // addressInfo.className = "address-info";
            // sofaAddress.appendChild(addressInfo);

            let placeImg = document.createElement("img");
            placeImg.src=`http://www.google.com/s2/favicons?domain=${places[i].url}`;
            placeImg.height = 24;
            placeImg.width = 24;
            placeImg.className = "img-place";
            sofaAddress.appendChild(placeImg);

            let nameH5 = document.createElement("h5");//add the name of marker
            nameH5.innerText = places[i].name;
            nameH5.className = "name-place";
            sofaAddress.appendChild(nameH5);

            let holdOpenButton = document.createElement("p");
            holdOpenButton.className = "expand-button";
            holdOpenButton.innerText = "V";
            sofaAddress.appendChild(holdOpenButton);

            let addressP = document.createElement("p");//add the address for marker
            let addressString = "";
            addressP.className = "address-name";
            // console.log(places[i]);
            geocoder.geocode({"placeId":places[i].placeId},//decode the placeId to get address
            function(res, status){
                geocodeFunc(res,status,places[i].placeId,addressP,sofaAddress);
            });
        }
    }
}

function geocodeFunc(res,status,placeId,addressP,sofaAddress){
    if(status=="OK"){
        // console.log(res[0]);
        // addressString = res[0].formatted_address;
        let aC = res[0].address_components;
        let addressString = `${aC[2].long_name}, ${aC[1].short_name}, ${aC[0].short_name}`;
        addressP.innerText = addressString;
        sofaAddress.appendChild(addressP);
    }
    else{//TODO what should happen when you dont get the address(it happens a lot more frequently than expected)
        console.log(status);
        // geocoder.geocode({"placeId":placeId},//decode the placeId to get address
        // function(res, status){
        //     geocodeFunc(res,status,placeId,addressP,sofaAddress);
        // });
        addressP.innerText = addressString;
        sofaAddress.appendChild(addressP);
    }
}

//fill the map with markers
function fillMapWithPlaces(map,lang,step,lat,lon,min,max,inc){
    if(map!=null){//if the map was initialized
        // let urlCurr = theUrl+`step/${lang}/${step+1}/area/${lat}/${lon}/${rad}`;//url request
        let urlCurr = theUrl+`step/${lang}/${step+1}/area/${lat}/${lon}/${min}/${max}/${inc}`;//url request
        // console.log(myMarker.getPosition());
        bounds = new google.maps.LatLngBounds();
        bounds.extend(myMarker.getPosition());
        $.ajax({
            url: urlCurr
        })
        .then(function(placesArr){
            clearMap();//clear map from markers if threre are already some
            
            if(placesArr.length!=0){//if there are any places
                
                for(var i=0;i<placesArr.length;i++){
                    let icon = {
                        url: icons[currentStep+1], // url
                        scaledSize: new google.maps.Size(20, 30), // scaled size
                        origin: new google.maps.Point(0,0), // origin
                        anchor: new google.maps.Point(0, 0) // anchor
                    };//set the icon for marker
                    let marker = new google.maps.Marker({
                        map: map,
                        icon: icon,
                        place: {
                        placeId: placesArr[i].placeId,
                        location: { lat: placesArr[i].latitude, lng: placesArr[i].longitude}
                        },
                        zIndex: 0
                    });//set marker
                    bounds.extend({ lat: placesArr[i].latitude, lng: placesArr[i].longitude});
                    markers.push(marker);//push marker to gloabal array so that you could delete them in future or change icons

                }
                map.fitBounds(bounds);
                fillSofaAddresses(placesArr);//fill the div with information about markers
            }
            else{
                let infoOfMarker = $(".info-of-marker");
                infoOfMarker.empty();
                $(".sofa-address").empty();
                console.log("no places found");
            }
        });
        hideLoading();
    }
    
}

function initMap(){//initialize the google map
    bounds = new google.maps.LatLngBounds();
    geocoder = new google.maps.Geocoder;//get the geocoder to decode placeIds in further
    navigator.geolocation.getCurrentPosition(successMap, errorMap, options);//get location
}