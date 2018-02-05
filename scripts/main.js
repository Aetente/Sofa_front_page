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
    setLanguage(nowLanguage);//set change language buttons clicks in right menu
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
        highlightLanguage(lang)
    });
}

function setLanguage(nowLanguage){
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
    let coords = pos.coords;
    var uluru = {lat: coords.latitude, lng: coords.longitude};
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 10,
          center: uluru
        });
        var marker = new google.maps.Marker({
          position: uluru,
          map: map
        });
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

function initMap(){
    navigator.geolocation.getCurrentPosition(successMap, errorMap, options);
}