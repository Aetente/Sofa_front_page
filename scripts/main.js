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
];
let geocoder;
let weekDay = [
    "mon","tue","wed","thu","fri","sat","sun"
];

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
    geocoder = new google.maps.Geocoder;
    lat = pos.coords.latitude;
    lon = pos.coords.longitude;
    var img = new window.Image();
    img.src = icons[10];
    img.width/=10;
    img.width/=10;
    var icon = {
        url: icons[10], // url
        scaledSize: new google.maps.Size(20, 20), // scaled size
        origin: new google.maps.Point(0,0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
    };
    var uluru = {lat: lat, lng: lon};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: uluru
    });
    var marker = new google.maps.Marker({
        position: uluru,
        map: map,
        icon: icon
    });
    fillMapWithPlaces(map,nowLanguage,currentStep,lat,lon,10);
}

//if geolocation error happened
function errorMap(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
    $(".step-description").css("grid-template-columns", "1fr");
    $(".the-info").css("grid-template-columns","1fr");
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

function onAddressClick(sofaAddress,markerNumber,place){
    $(".sofa-address").hide(0);
    console.log(markerNumber);
    let descriptionHelp = $(".description-help");
    let divToRemove =document.createElement("div");
    divToRemove.className = "div-to-remove";
    descriptionHelp.append(divToRemove);

    let divWrap = document.createElement("div");
    divToRemove.append(divWrap);

    let markerInfo = document.createElement("div");
    divWrap.append(markerInfo);

    let nameH5 = document.createElement("h5");
    nameH5.append(place.name);
    markerInfo.append(nameH5);

    for(var j=0; j<place.phones.length; j++){
        markerInfo = document.createElement("div");
        markerInfo.className = "marker-info";
        divWrap.append(markerInfo);
        let phoneH6 = document.createElement("h6");
        phoneH6.append(place.phones[j]);
        markerInfo.append(phoneH6);
    }

    for(var k=0; k<7;k++){
        markerInfo = document.createElement("div");
        markerInfo.className = "marker-info";
        divWrap.append(markerInfo);
        let scheduleP = document.createElement("p");
        let strDay = place.schedule[k];
        let nameWeek = document.createElement("p");
        nameWeek.append(weekDay[k]);
        scheduleP.append(strDay);
        markerInfo.append(nameWeek);
        markerInfo.append(scheduleP);
    }


    markerInfo = document.createElement("div");
    divWrap.append(markerInfo);
    let urlBtn = document.createElement("button");
    urlBtn.append("Go to the site");
    urlBtn.onclick = function(){
        window.open("http://"+place.url,"_blank");
    }
    markerInfo.append(urlBtn);

    markerInfo = document.createElement("div");
    divWrap.append(markerInfo);
    let closeBtn = document.createElement("button");
    closeBtn.append("Close");
    closeBtn.onclick = function(){
        // window.open("http://"+place.url,"_blank");
        closeCurrentMarker();
    }
    markerInfo.append(closeBtn);

}

function closeCurrentMarker(){
    $(".div-to-remove").remove();
    $(".sofa-address").show(0);
}

function fillSofaAddresses(places){
    let descriptionHelp = $(".description-help");
    descriptionHelp.empty();
    console.log(places);
    if(places.length>0){
        for(let i=0; i<places.length; i++){
            
            let sofaAddress = document.createElement("div");
            sofaAddress.className = "sofa-address marker"+i;
            descriptionHelp.append(sofaAddress);
            sofaAddress.onclick = ()=> onAddressClick(sofaAddress,i,places[i]);

            let imAddress = document.createElement("img");
            imAddress.className = "im-address";
            sofaAddress.append(imAddress);

            let addressInfo = document.createElement("div");
            addressInfo.className = "address-info";
            sofaAddress.append(addressInfo);

            let nameH5 = document.createElement("h5");
            nameH5.append(places[i].name);
            sofaAddress.append(nameH5);

            let addressP = document.createElement("p");
            let addressString = "address error";
            geocoder.geocode({"placeId":places[i].placeId},
            function(res, status){
                if(status=="OK"){
                    addressString = res[0].formatted_address;
                    addressP.append(addressString);
                    sofaAddress.append(addressP);
                }
                else{
                    addressP.append(addressString);
                    sofaAddress.append(addressP);
                }
            });
            
        }
    }
}

// function fillSofaAddresses(places){
//     let descriptionHelp = $(".description-help");
//     descriptionHelp.empty();
//     // console.log(places);
//     if(places.length>0){
//         for(var i=0; i<places.length; i++){
//             let sofaAddress = document.createElement("div");
//             sofaAddress.className = "sofa-address";
//             descriptionHelp.append(sofaAddress);

//             let imAddress = document.createElement("img");
//             imAddress.className = "im-address";
//             sofaAddress.append(imAddress);

//             let addressInfo = document.createElement("div");
//             addressInfo.className = "address-info";
//             sofaAddress.append(addressInfo);

//             let nameH5 = document.createElement("h5");
//             nameH5.append(places[i].name);
//             sofaAddress.append(nameH5);

//             for(var j=0; j<places[i].phones.length; j++){
//                 let phoneP = document.createElement("p");
//                 phoneP.append(places[i].phones[j]);
//                 sofaAddress.append(phoneP);
//             }

//             for(var k=0;k<places[i].schedule.length; k++){
//                 let scheduleP = document.createElement("p");
//                 scheduleP.append(places[i].schedule[k]);
//                 sofaAddress.append(scheduleP);
//             }

//             let urlA = document.createElement("a");
//             urlA.append(places[i].url);
//             sofaAddress.append(urlA);
//         }
//     }
// }

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
                    
                    var icon = {
                        url: icons[currentStep+1], // url
                        scaledSize: new google.maps.Size(20, 30), // scaled size
                        origin: new google.maps.Point(0,0), // origin
                        anchor: new google.maps.Point(0, 0) // anchor
                    };
                    var marker = new google.maps.Marker({
                        map: map,
                        icon: icon,
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