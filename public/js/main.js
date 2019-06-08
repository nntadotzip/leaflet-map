
function populationColor(popEst) {
    if (popEst>100000000){
        return 'red';
    } else if (popEst>50000000){
        return 'orange';
    } else
        return 'grey';
}

function countryStyle(feature) {
    return{
        fillColor: populationColor(feature.properties.POP_EST),
        weight: 2,
        opacity: 1,
        color: '#fff',
        dashArray: 2,
        fillOpacity: 0.7
    }
}
var map = L.map('map').setView([10.858276, 106.783586], 15);
// var countriesLayer = L.geoJson(
//     countries,
//     {
//         style: countryStyle
//     }
// ).addTo(map);
//map.fitBounds(countriesLayer.getBounds());

var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
    var divLegend = L.DomUtil.create('div', 'legend');
    var labels = [
        'Pop > 100 000 000',
        'Pop > 50 000 000',
        'Pop < 50 000 000'
    ];
    var grades = [100000001, 50000001, 50000000];
    divLegend.innerHTML = '<p><b>Legend</b></p>';

    for (var i=0; i<grades.length; i++){
        divLegend.innerHTML += '<i style="background:'
            + populationColor(grades[i]) +'">&nbsp;&nbsp;</i>&nbsp;&nbsp;'
            + labels[i]
            + '<br />';
    }
    return divLegend;
}
legend.addTo(map);

// var position = [10.877979, 106.801427];
// var marker = L.marker(position);
// marker.addTo(map);
// marker.bindPopup('<p>International University</p><img style="width: 100%;" src="public/img/university-icon.png" alt="IU" />');

var roadmap = L.gridLayer.googleMutant({
    type: 'roadmap'
}).addTo(map);

var myLocation = {
    locationName : 'this is my house',
    locationType : 'nha rieng',
    locationCoordinate: [10.877979, 106.801427],
    locationStatus : 1
};
console.log(myLocation.locationName);

var colorDot = myLocation =>
    //1: available, 0: sold
    (myLocation.locationStatus === 1) ? 'red' : 'grey';

function dotMark(myLocation) {
     var circle = L.circle(
         myLocation.locationCoordinate,
         100,
         {
             color: colorDot(myLocation),
             fillColor: colorDot(myLocation),
             fillOpacity: 1
         }
     ).addTo(map);
}

dotMark(myLocation);

geoCode();
function geoCode(){
    var location = '1600 Amphitheatre Parkway, Mountain View, CA';
    axios.get('http://www.datasciencetoolkit.org/maps/api/geocode/json', {
        params: {
            address: location,
            key: 'AIzaSyDJKCIvJwehLHCpGT2jNrSJP9KSTfoRzPE'
        }
    }).then(function (response) {
        console.log(response);
        console.log("alo", response.data.results[0]);
        var lat = response.data.results.geometry.location.lat;
        var lng = response.data.results[0].geometry.location.lng;
        var area_level_2 = response.data.results[0].address_components.types.administrative_area_level_2;
        console.log("alo", lat, lng, area_level_2);
    }).catch(function (error) {
        console.log(error);
    });
}