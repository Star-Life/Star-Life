/*
/	Author: Bruce Kirwan
/	Web development Assignment A part 1
/	August 2019
/
/	This file contains the javascript for the contact webpage (contact.html)
/	It contains SVG images with animation and location services
/   The location services consists of a google embedded map which shows 
/	how to get from your detected location to Finglas ETB.
/
*/



window.addEventListener('DOMContentLoaded', function (event) {
    console.log("DOM fully loaded and parsed and in contact.js...");
    addMoreEvents();
	/*
	/	do not show images if small screen
	*/
	var smallView = window.matchMedia("(max-width: 199px)")
	if (smallView.matches) {	//
		document.getElementById("first-image").style.display="none";
		document.getElementById("second-image").style.display="none";
		document.getElementById("third-image").style.display="none";
	}
	/*
	/	detect location and show route to Finglas ETB on the google map
	*/
	getLocation();


});

/*
/	add the event to animate the SVG images upon mouse over (hover)
*/
function addMoreEvents() {
	$(".svg-images").hover(function(){
		var x = this.getElementsByTagName("animateTransform");  
		try {
			x[0].beginElement();			// initiate animation
		} catch (e) {
			console.log(e);	// output message to console if error
		}
	}, function(){});
}

      // Note: This example requires that you consent to location sharing when
      // prompted by your browser. If you see the error "The Geolocation service
      // failed.", it means you probably did not give permission for the browser to
      // locate you.
/*
/	function to get the location of the user (if they provide consent)
*/
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else { 
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

/*
/	function to display a google map showing how to travel from the user's location
/	to Finglas ETB.
*/
function showPosition(position) {
	document.getElementById("map-title").innerHTML = "The recommended route from your location to us, is below:";	
	y="";
	document.getElementById("google-map").innerHTML = <+y+></iframe>;
		document.getElementById("map-title").innerHTML = "AAAA   "+ y +"   AAAA";	
}
