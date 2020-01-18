/*
/	Author: Bruce Kirwan
/	Web development Assignment A part 1
/	August 2019
/
/	This file contains the javascript for the calendar/scheduling function of 
/	my website on the Availability page (availability.html)
/
*/

MAX_DEPTH = 50; 
var canvas, ctx;
var stars = new Array(512);
var windowWidth = 1000;
var windowHeight=150;
var sizeFactor=1.0;			// this changes for mobile view
var today = new Date();
var currentWeekDay = today.getDay();
var currentDay = today.getDate();
var currentMonth = today.getMonth();
var currentYear = today.getFullYear();
var selectDate = new Date(today);
var selectWeekDay = currentWeekDay;
var selectDay = currentDay;
var selectMonth = currentMonth;
var selectYear = currentYear;
var displayDate = new Date(today);
var firstOfMonth = new Date(today);
var oneYearFromToday = new Date(today);
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var times = ["6.00am","6.30am","7.00am","7.30am","8.00am","8.30am","9.00am","9.30am","10.00am","10.30am","11.00am","11.30am","12 noon","12.30pm","1.00pm","1.30pm",
	"2.00pm","2.30pm","3.00pm","3.30pm","4.00pm","4.30pm","5.00pm","5.30pm","6.00pm","6.30pm","7.00pm","7.30pm","8.00pm","8.30pm","9.00pm","9.30pm","10.00pm","10.30pm"];
var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var displayingDay = false;
var jsonPresent = false;
var jsonNotFound = false;
console.log('... calendar.js has loaded ...');

var removeCanvas = true;		// remove canvas when displaying schedule for one day
var narrowView = window.matchMedia("(max-width: 600px)")

var jsonData = null;

/*
/	below is executed upon page load 
*/
window.addEventListener('DOMContentLoaded', function (event) {
    console.log("DOM fully loaded and parsed and in calendar.js...");
	if (narrowView.matches) 		// keep canvas for smaller widths
		removeCanvas = false;
	oneYearFromToday = oneYearFromToday.setYear(oneYearFromToday.getFullYear()+1);		// get date exactly one year from today
	initialiseCalendar();
	fetchJsonDataFile();
    addMoreEvents();
});

/*
/	add more javascript listener events (in addition to those already added
/	by site.js or siteMobile.js 
*/
function addMoreEvents() {
	document.getElementById("month").onclick = function(e) {
		e = e || event
		var target = e.target || e.srcElement
		// variable target has your clicked element
		if (target.nodeName == "TD") {
			var dayNum = parseInt(target.innerHTML, 10);
			displayDate = new Date(selectYear + "-" + twoDigit(selectMonth+1) + "-" + twoDigit(dayNum));
			initialiseDay();
		}
	}
	document.getElementById("next").onclick = function() {
		if (displayingDay)  {
			displayDate.setDate(displayDate.getDate() + 1);	
			if (displayDate.getDate()==1) {		// if have moved into next month,
				selectDate = displayDate;
				initialiseCalendar();			// also update the month calendar
			}				
			initialiseDay();					
		} else  {
			var x = firstOfMonth.getMonth();
			selectDate = new Date(firstOfMonth.setMonth(firstOfMonth.getMonth()+1));
			x = selectDate.getMonth();
			initialiseCalendar();
		}
	}
	document.getElementById("previous").onclick = function() {
		if (displayingDay)  {
			if (displayDate.getDate()==1) {		// if moving back to previous month,
				displayDate.setDate(displayDate.getDate() - 1);	
				selectDate = displayDate;
				initialiseCalendar();			// also update the month calendar
			} else {
				displayDate.setDate(displayDate.getDate() - 1);	
			}
			initialiseDay();

		} else  {
			var x = firstOfMonth.getMonth();
			selectDate = new Date(firstOfMonth.setMonth(firstOfMonth.getMonth()-1));
			initialiseCalendar();
		}
	}
	document.getElementById("returnToMonth").onclick = function() {
		document.getElementById("day").style.display = "none";
		document.getElementById("returnToMonth").innerHTML = "";
		document.getElementById("canvas").style.display = "block";
		document.getElementById("color-fade").style.display = "block";
		document.getElementById("year").innerHTML = months[selectMonth] + " " + selectYear;
		displayingDay = false;
	}	
}

/*
/	function to display a month of the year
/	fade out dates before current date 
/	(and dates that belong to the next month).
*/
function initialiseCalendar() { 
	document.getElementById("canvas").style.display = "block";
	document.getElementById("color-fade").style.display = "block";
	selectMonth = selectDate.getMonth();
	selectYear = selectDate.getFullYear();
	var startDay = 1;						// default show from 1st of month
	if (selectDate < today) 
		selectDate = today;
	selectDay = selectDate.getDate();
	document.getElementById("year").innerHTML = months[selectMonth] + " " + selectYear;
	/*
	/   do not show previous button, if the month is before the current month
	*/
	if ((selectDate.getYear() <= today.getYear())&&(selectDate.getMonth() <= today.getMonth())) {
		document.getElementById("previous").style.display = "none";
	} else {
		document.getElementById("previous").style.display = "block";
	}
	/*
	/   do not show next button, if the month is after one year into the future
	*/
	if ((selectDate.getYear() > today.getYear())&&(selectMonth >= today.getMonth())) {
		document.getElementById("next").style.display = "none";
	} else {
		document.getElementById("next").style.display = "block";
	}
	// get the first day of the month, so know what day of the week to start adding day of month numbers
	var dateText = selectYear + "-" + twoDigit(selectMonth+1) + "-01";
    //firstOfMonth = new Date(selectYear+"-"+(selectMonth+1)+"-01");
	firstOfMonth = new Date("2019-08-01");
	firstOfMonth=new Date(selectYear + "-" +  twoDigit(selectMonth+1) + "-01");	// get Date object for the first day of the current month
	if (firstOfMonth < today) 				// if first of month is before current date (today)
		startDay = currentDay;				// then do not show days before current date (today)
	var firstDayOfMonth = firstOfMonth.getDay();
	var selectDay = firstOfMonth.getDate();
	// create the table of days of month
	var tbl = document.getElementById("month");
	tbl.innerHTML = "";		// body of the calendar
	/*
	// create and add the header for the days of the week
	*/
	var row = document.createElement("tr");
	for (var i=0; i < 7; i++) {
		var cell = document.createElement("th");
		var cellText = document.createTextNode(days[i]);
		cell.appendChild(cellText);
        row.appendChild(cell);
	}
	tbl.appendChild(row);
	/*
	/   next, write out the first row of days of the month
	*/
	row = document.createElement("tr");
	var day;
	for (var i=0;i<firstDayOfMonth; i++) {
		cell = document.createElement("th");
		row.appendChild(cell);
	}
	for (var i=firstDayOfMonth; i < 7; i++) {
		if (selectDay < startDay) {
			cell = document.createElement("th");
			cell.style.color = "rgb(0,0,153)";
		} else {
			cell = document.createElement("td");
		}		
		cellText = document.createTextNode(selectDay);
		cell.appendChild(cellText);
        row.appendChild(cell);
		selectDay++;
	}
	tbl.appendChild(row);
	/*
	/   then write out the next 3 rows of days of the month
	*/
	for (var i = 0; i < 3; i++) {
		row = document.createElement("tr");
		//   create each cell in table of month dates
		for (var j=0; j<7; j++) {
			if (selectDay < startDay) {
				cell = document.createElement("th");
				cell.style.color = "rgb(0,0,153)";
			} else {
				cell = document.createElement("td");
			}
			cellText = document.createTextNode(selectDay);
			cell.appendChild(cellText);
			row.appendChild(cell);
			selectDay++;
		}
		tbl.appendChild(row);
	}
	
	selectDate = new Date(selectYear+"-"+twoDigit(selectMonth+1)+"-"+selectDay);
	row = document.createElement("tr");
	//   create each cell in table of month days
	for (var j=0; j<7; j++) {
		day = selectDate.getDate();
		cellText = document.createTextNode(day);		
		if ( (day < 7) ||  (day < startDay) )  {
			cell = document.createElement("th");
			cell.style.color = "rgb(0,0,153)";
		} else {
			cell = document.createElement("td");
		}
		cell.appendChild(cellText);
		row.appendChild(cell);
		selectDate.setDate(selectDate.getDate() + 1);
	}
	//  add the new row to the table
	tbl.appendChild(row);
}
/*
/	function to copy data from file 'availability.json' on my github account, to the variable jsonData
*/
function fetchJsonDataFile() {		
	console.log("About to fetch JSON data file");
	$.ajax({
		url: 'https://raw.githubusercontent.com/Bruce-Kirwan/StarLife/master/availability.json',
		dataType: 'json',
		success: function( data ) {
			jsonData = data; 
			if (jsonData==null)
				jsonNotFound = true;
			else
				jsonPresent = true;
			var jsString = JSON.stringify(jsonData);
//	now try to store the fetched data in localStorage		
			try {
				localStorage.setItem('StarLifeAvailability',jsString);	// store json availability string in local storage
			} catch (e) {
				console.log(e);											// output message to console if error writing to localStorage
			}
			console.log('stored availability in StarLifeAvailability');
			setTimeout(fetchJsonDataFile,10000);					// refresh every 10 seconds
			if (displayingDay)										// if a date has been chosen, refresh display
				initialiseDay();
		},
		error: function( data ) {
			console.log("error getting availability.json");
			var jsString = "";
			try {
				jsString = localStorage.getItem('StarLifeAvailability');			// try to retrieve json availability data from local storage
			} catch (e) {
				console.log(e);	// output message to console if error
			}
			jsonData = JSON.parse(jsString);
			console.log("tried to get item from localStorage");
			console.log(jsonData);
			if (jsString==null) {
				console.log('jsString is null');
				jsonPresent = false;
				jsonNotFound = true;
			}
			else
				jsonPresent = true;
			setTimeout(fetchJsonDataFile,45000);					// refresh every 45 seconds
		}
	});
}


/*
/	function to set up and build a schedule for a selected date 
/	(stored in variable "displayDate") 
*/
function initialiseDay() {		
	selectYear = displayDate.getFullYear();
	selectMonth = displayDate.getMonth();
	selectDay = displayDate.getDate();;
	/*
	/	create a table of the schedule
	*/
	$("#day").empty();						// first clear any existing rows from day table
	if (removeCanvas)		// remove the canvas, unless we are in mobile view
		document.getElementById("canvas").style.display = "none";
	document.getElementById("color-fade").style.display = "none";
	document.getElementById("year").innerHTML = selectDay + " " + months[selectMonth];
	var createSchedule = document.getElementById("day");
	createSchedule.style.display = "block";
	var schedRow;
	console.log('.............in initialiseDay, jsonPresent is '+jsonPresent);
	console.log('............in initialiseDay, jsonNotFound is '+jsonNotFound);
	if (jsonPresent) {
		for (var i = 0, len = times.length; i < len; i++) {
			schedRow = createSchedule.insertRow();
			schedRow.innerHTML="<th>" + times[i] + "</th><td>FREE</td>";
		}	
		displayingDay = true;
	} else {
		schedRow = createSchedule.insertRow();
		if (jsonNotFound) 
			schedRow.innerHTML = "<td><h3>Unable to retrieve schedule of bookings for Star Life.</h3>-</td><td></td>";
		else {
			schedRow.innerHTML = "<td><h3>Schedule of bookings not loaded to this website yet.</h3> Please try again later.</td><td></td>";
			displayingDay = true;
		}
	}
	/*
	/   now, display button to return to the month
	*/
	document.getElementById("returnToMonth").innerHTML = "return to month";
	/*
	/   do not show previous button, if the month is before the current month
	*/
	if (displayDate <= today) {
		document.getElementById("previous").style.display = "none";
	} else {
		document.getElementById("previous").style.display = "block";
	}
	/*
	/   do not show next button, if after one year into the future
	*/
	if (displayDate >= oneYearFromToday) {
		document.getElementById("next").style.display = "none";
	} else {
		document.getElementById("next").style.display = "block";
	}
	showBooked(displayDate);
	document.body.scrollTop = document.documentElement.scrollTop = 0;	// scroll to very top of page
}

/*
/	function to update schedule with times booked according to information received
	from the JSON file
*/
function showBooked(inpDate) {
	inpDate.setHours(12);			// make sure time is 12 noon so that next line won't decrement by one day
	searchDate = inpDate.toISOString().substring(0,10);			// just get the first 10 characters (we do not need the time portion of the date)
	$.each(jsonData, function(key, value) {
        if (key == searchDate) {								// search for a match on the date we are looking at
			var time = 0;
			var count = 1;
			$.each(value, function(key, value) {
				$.each(value, function(key,value) {
					if (key=='time')
						time = value;
					else (key = 'halfHours')
						count = value;
				});
				for (i=0; i<count; i++) {				// change text and background color for times 
					var x = document.getElementById("day").rows[time];
					x.style.backgroundColor = 'rgb(255,153,153)';
					x.cells[1].innerHTML = "Booked";								// change text from FREE to Booked
					time++;
				}
			});
		return false; // stops the loop
        }
	});
}

/*
/		function to convert integer month or day to text value for use in creating a new Date object
*/
function twoDigit(inpNum) {
	var textNum = "";					// variable containing the return value
	if (inpNum > 9)						// if two digit month....
		textNum += inpNum;				// simply return the text value of the month
	else
		textNum = "0" + inpNum;			//otherwise, add a 0 before the month
	return textNum;
}




