 // Client ID and API key from the Developer Console
 var CLIENT_ID = 'CLIENT_ID';
 var API_KEY = 'API_KEY';
 // Array of API discovery doc URLs for APIs used by the quickstart
 var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
 // Authorization scopes required by the API; multiple scopes can be
 // included, separated by spaces.
 var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

 var authorizeButton = document.getElementById('authorize_button');
 var signoutButton = document.getElementById('signout_button');
 var container = document.getElementById('container');
 var right = document.getElementById('right');
 var left = document.getElementById('left');
 var events;
 /**
  *  On load, called to load the auth2 library and API client library.
  */
 function handleClientLoad() {
   gapi.load('client:auth2', initClient);
 }
 /**
  *  Initializes the API client library and sets up sign-in state
  *  listeners.
  */
 function initClient() {
   gapi.client.init({
     apiKey: API_KEY,
     clientId: CLIENT_ID,
     discoveryDocs: DISCOVERY_DOCS,
     scope: SCOPES
   }).then(function () {
     // Listen for sign-in state changes.
     gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
     // Handle the initial sign-in state.
     updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
     authorizeButton.onclick = handleAuthClick;
     signoutButton.onclick = handleSignoutClick;
   }, function(error) {
     appendPre(JSON.stringify(error, null, 2));
   });
 }
 /**
  *  Called when the signed in status changes, to update the UI
  *  appropriately. After a sign-in, the API is called.
  */
 function updateSigninStatus(isSignedIn) {
   if (isSignedIn) {
     authorizeButton.style.display = 'none';
     container.style.display = 'flex';
     signoutButton.style.display = 'block';
     listUpcomingEvents();
   } else {
     authorizeButton.style.display = 'block';
     signoutButton.style.display = 'none';
     container.style.display = 'none';
   }
 }
 /**
  *  Sign in the user upon button click.
  */
 function handleAuthClick(event) {
   gapi.auth2.getAuthInstance().signIn();
 }
 /**
  *  Sign out the user upon button click.
  */
 function handleSignoutClick(event) {
   gapi.auth2.getAuthInstance().signOut();
 }
 /**
  * Append a pre element to the body containing the given message
  * as its text node. Used to display the results of the API call.
  *
  * @param {string} message Text to be placed in pre element.
  */
 function appendPre(message) {
   var pre = document.getElementById('content');
   var textContent = document.createTextNode(message + '\n');
   pre.appendChild(textContent);
 }

 /**
  * Print the summary and start datetime/date of the next ten events in
  * the authorized user's calendar. If no events are found an
  * appropriate message is printed.
  */
 function listUpcomingEvents() {
   gapi.client.calendar.events.list({
     'calendarId': 'primary',
     'alwaysIncludeEmail': true,
     'timeMin': (new Date()).toISOString(),
     'showDeleted': false,
     'singleEvents': true,
     'orderBy': 'startTime'
   }).then(function(response) {

      let eventString ='';
      var attendence = '';
      let timeToEvent = 0;
      let countUnnamedAttendees = 0;
      events = response.result.items;
      createDateElement();

      events=events.filter(checkTimeToEvent);
    
      if (events.length > 0) {
        for (i = 0; i < events.length; i++) {
         let event = events[i];
         
         let when = event.start.dateTime;
         let last = event.end.dateTime;
         let startDate = new Date(when);
         let endDate = new Date(last);
         let startTime_endTime = startDate.getHours()+':'+startDate.getMinutes()+' - '+endDate.getHours()+':'+endDate.getMinutes();
         
         if (!when) {
           when = event.start.date;
         }
         //Add attendee names 
         if (undefined!= events[i].attendees){
          for(x=1; x<events[i].attendees['length']; x++){
            if (undefined===events[i].attendees[x].displayName){
             countUnnamedAttendees += 1;
            }
            else{
             attendence += events[i].attendees[x].displayName+', ';
            }
          }
         } 
           attendence += countUnnamedAttendees+' other unnamed people';
           timeToEvent = startDate.getTime()-(new Date()).getTime();
           var Notify5minsBeforeTime = timeToEvent-300000;

          //reload when event starts
          setTimeout(function(){
            window.location.replace(window.location.pathname + window.location.search + window.location.hash);
          },timeToEvent);
      
          let notifyUser = ' Five minutes left to '+event.summary +' attended by '+ attendence; 
          
          eventString = event.summary; // display event summary
         
          //add location if available
          if(undefined != event.location){
            eventString = eventString +' at '+ event.location ;
         }
          createElement(eventString, startTime_endTime);
            
          //notify user 5 mins before event
          setTimeout(function(){
           var utterance = new SpeechSynthesisUtterance(notifyUser);
           window.speechSynthesis.speak(utterance);
          },Notify5minsBeforeTime);
           
          attendence = ''; //clear attendence 
          eventString = ''; //clear eventString
        }

      }
      else {
          createElement('No upcoming events found.', '');
      }  
   });
  }

//Function to create element with event time period and summary
 function createElement(stringInput, beginEndTime) {
  let row = document.createElement("div");
  let rowLeft = document.createElement("div");
  let rowRight = document.createElement("div");

  //create attribute
	let att1 = document.createAttribute("class"); 
  let att2 = document.createAttribute("class"); 
  let att3 = document.createAttribute("class"); 

  //assign attribute
	att1.value="row";
  att2.value="row-left";
  att3.value="row-right";

	row.setAttributeNode(att1); 
  rowLeft.setAttributeNode(att2); 
  rowRight.setAttributeNode(att3); 

	rowLeft.appendChild(document.createTextNode(beginEndTime));
	rowRight.appendChild(document.createTextNode(stringInput));

  //add created element to DOM
	row.appendChild(rowLeft);
  row.appendChild(rowRight);
  right.appendChild(row);
  }

  //Function to create and add today's date
  function createDateElement() {
    let todayDate = document.createElement("div");
    let day = document.createElement("div");
    let date = document.createElement("div");
  
    let att1 = document.createAttribute("id"); 
    let att2 = document.createAttribute("id"); 
    let att3 = document.createAttribute("id"); 
  
    //assign value to attribute
    att1.value="todayDate";
    att2.value="day";
    att3.value="date";
  
    todayDate.setAttributeNode(att1); 
    day.setAttributeNode(att2); 
    date.setAttributeNode(att3); 

    let today = new Date();
    let thisDay = abbrevDayOfWeek(today.getDay());
    let thisDate =  abbrevMonth(today.getMonth()+1)+' '+today.getDate()+','+today.getFullYear();
  
    day.appendChild(document.createTextNode(thisDay));
    date.appendChild(document.createTextNode(thisDate));
   
    //add created element to DOM
    todayDate.appendChild(day);
    todayDate.appendChild(date);
    left.appendChild(todayDate);
    }

  //convert integer day to day in words
  function abbrevDayOfWeek(day) {
    let day_array = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    return day_array[day];
  }

  //function to convert date digit to word
  function abbrevMonth(day) {
    let day_array = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return day_array[day-1];
  }

  //function to check time to event inorder to skip already started events.
 function checkTimeToEvent(event){
  let when = event.start.dateTime;
  let startDate = new Date(when);
  let time2Event = startDate.getTime()-(new Date()).getTime();
  if (time2Event > 0){
    return event;
  }
 }
