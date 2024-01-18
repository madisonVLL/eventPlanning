// These are the names of the different databases used in this website. They all have different functions for website. 
//dbNames = ["HostInfo", "GuestInfo", "TaskInfo"];
function itemDB(dbName) {
    var request = indexedDB.open(dbName, 2);
    request.onerror = (event) => {
        console.error("cannot open " + dbName);
    }
    request.onupgradeneeded = (event) => {
        var db = event.target.result;
        if (dbName == "HostInfo") {
            const objectStore = db.createObjectStore("HostInfo", {keyPath: "phone"});
            objectStore.createIndex("phone", "phone", {unique: true});
            //objectStore.createIndex("firstName", "firstName", {unique: false});
            //objectStore.createIndex("lastName", "lastName", {unique: false});
        }
        else if (dbName == "GuestInfo") {
            const objectStore = db.createObjectStore("GuestInfo", {keyPath: "phone"});
            objectStore.createIndex("phone", "phone", {unique: true});
            //objectStore.createIndex("firstName", "firstName", {unique: false});
            //objectStore.createIndex("lastName", "lastName4", {unqiue: false});
        }
        else if (dbName == "TaskInfo") {
            const objectStore = db.createObjectStore("TaskInfo", {keyPath: "date"});
            //objectStore.createIndex("date", "date", {unique: false});
            objectStore.createIndex("task", "task", {unique: false});
        }
        else {
            console.error("Improper DB name")
        }
        console.log("Database Upgraded")
    }
    request.onsuccess = (event) => {
        var db = event.target.result;
        console.log("Database Opened -> " + db.name);
        var transaction = db.transaction(dbName, "readonly").objectStore(dbName);
        var countRequest = transaction.count();
        countRequest.onsuccess = (event) => {
        var dataCount = countRequest.result;
        if (dataCount >= 1) {
            switchTable(dbName)
        }
        else {
            return false;
        }
    }
}
}

function addToIndex(dbName, data) {
    var request = indexedDB.open(dbName, 2);
    request.onerror = (event) => {
        console.error("Cannot open index to add")
    }
    request.onsuccess = (event) => {
        var db = event.target.result;
        var transaction = db.transaction(dbName, "readwrite").objectStore(dbName);
        //had to create a different request after opening database

        var addRequest = transaction.add(data);
        addRequest.onsuccess = (event, data) => {
            console.log("Item added to " + dbName);
        }
        addRequest.onerror = (event) => {
            console.error("Cannot add item to " + dbName);
            errorAddAlert();
        }
    }
};

function displayList(dbName) {
    var request = indexedDB.open(dbName, 2);
    request.onerror = (event) => {
        console.error("Cannot open index to display")
    }
    clearTableBydbName(dbName);
    request.onsuccess = (event) => {
        var db = event.target.result;
        var transaction = db.transaction(dbName, "readonly");
        var store = transaction.objectStore(dbName);
        req = store.count();
        req.onsuccess = (event) => {
            if (req === 1) {
                if (dbName == "HostInfo") { console.log("one host"); $("hostCount").text("There is "
                 + req + " host for your event"); console.log("host cound displayed")}
                else if (store == "GuestInfo") {}
                else if (store == "TaskInfo") {}  
                else {}
            }
            else {
                if (dbName == "HostInfo") { $("hostCount").text("There are " + req + " hosts for your event")}
                else if (store == "GuestInfo") {}
                else if (store == "TaskInfo") {}  
                else {}  
            }
        }
        req.onerror = (event) => { console.error("cannot get count for " + store)};

        store.openCursor().onsuccess = (event) => {
            var cursor = event.target.result; 
            if (cursor) {
                if (dbName == "HostInfo") {
                    var $hostTR = "<tr><td>" + cursor.value.firstName + "</td><td>" + cursor.value.lastName 
                    + "</td><td>" + cursor.value.phone + "</td><td>" + cursor.value.email + "</td></tr>";
                    $hostTR.id = cursor.value.phone; 
                    $("#HostInfoTable").append($hostTR);  
                    cursor.continue(); 
                    if (cursor.value.address === "none" && cursor.value.eventName === "none") {
                        var eventTableHeaders = ["Event Type: ", "Event Date: ", "Invite Type: "]
                        var eventDetails = [cursor.value.eventType, listEventDate, cursor.value.inviteType]
                    } 
                    else if (cursor.value.eventName !== "none" && cursor.value.address === "none") {
                        var eventTableHeaders = ["Event Name: ", "Event Type: ", "Event Date: ", "Invite Type: "]
                        var eventDetails = [cursor.value.eventName, cursor.value.eventType, listEventDate, 
                            cursor.value.inviteType]
                    }
                    else if (cursor.value.eventName === "none" && cursor.value.address !== "none") {
                        var eventTableHeaders = ["Event Type: ", "Event Date: ", "Invite Type: ", 
                        "Invitation Return Address: "]
                        var eventDetails = [cursor.value.eventType, listEventDate, cursor.value.inviteType,
                             cursor.value.address]
                    }
                    else {
                        var eventTableHeaders = ["Event Name: ", "Event Type: ", "Event Date: ", "Invite Type: ",
                         "Invitation Return Address: "]
                        var eventDetails = [cursor.value.eventName, cursor.value.eventType, listEventDate,
                             cursor.value.inviteType, cursor.value.address]
                    }   
                    //combines two arrays and creates a key value pair. key = eventTableHeaders value = eventDetails
                    var eventObject = createObjectFromArrays(eventTableHeaders, eventDetails);
                    console.log(eventObject);
                    clearTableBydbName("EventDetails");
                    evntObj = Object.entries(eventObject);
                    var addEventDetails = evntObj.map( ([key, val] = entry) => {
                        $("$EventDetailsTable").append("<br> ${key} ${value}");
                    });
                    for (each in eventObject, i = eventDetails.length()) {
                        for (var key in eventObject) {
                        $("#eventDetailsTable").css("font-weight","Bold")
                        $("#eventDetailsTable").append("<br>" + key, eventObject[key]);
                        }
                    }
                    
                }
                else if (store == "GuestInfo") {

                }
                else if (store == "TaskInfo") {

                }
                else {

                }
            }
    }
    } 
}
//this function deteles a specic item/index from the database
function deleteByKey(dbName, phoneNumber, array) {
    var request = indexedDB.open(dbName, 2);
    request.onerror = (event) => {console.error("Cannor open index to delete item")};
    request.onsuccess = (event) => { 
        //after determining the database to detere an object, the function selects the type of index to delete
        if (dbName == "HostInfo" || dbName == "GuestInfo") {
            var db = event.target.result;
            var transaction = db.transaction(dbName, "readwrite").objectStore(dbName);
            //this selects the key so we can delete it from autofill
            var getKeyRequest = transaction.get(phoneNumber);
            getKeyRequest.onsuccess = (event) => {
                var keyResult = getKeyRequest.result;
                var deleteValues = [keyResult.lastName, keyResult.firstName, keyResult.phone];
                deleteValues.forEach((element) => (array.splice(array.indexOf(element),1) ))
            }
            var deleteRequest = transaction.delete(phoneNumber);
            deleteRequest.onsuccess = (event) => {
                console.log(dbName + " item deleted")
                displayList(dbName);
            }
            
        }
        else if (dbName == "TaskInfo"){

        }
    }
}
//this function clear whole database, while the function above just clears a 
function clearDatabase(dbName) {
    var request = indexedDB.open(dbName, 2);
    request.onerror = (event) => {
        console.error("Cannot open index to clear database")
    }
    request.onsuccess = (event) => {
        console.log("opened database to clear")
        var db = event.target.result;
        var transaction = db.transaction(dbName, "readwrite")
        var objectStore = transaction(dbName);
        var clearReq = objectStore.clear();
       var indexTable = "#" + dbName + "Table";
       $(indexTable).find("tr:gt(0)").remove();
       if(dbName === "HostInfo") {$("#eventDetailsTable").remove()}
       //$(this.indexTable + ':not(:first)').remove();
       
        clearReq.onsuccess = (event) => {
            console.log(dbName + " cleared")
        }
    }
}

function addToSearch(dbName, array) {
    var request = indexedDB.open(dbName, 2);
    request.onerror = (event) => {
        console.error("Cannot open " + dbName)
    }
    request.onsuccess = (event) => {
        var db = event.target.result;
        var transaction = db.transaction(dbName, "readonly");
        var store = transaction.objectStore(dbName);
        store.openCursor().onsuccess = (event) => {
            var cursor = event.target.result; 
            if (dbName == "HostInfo"|| dbName == "GuestInfo") { 
                array.unshift(cursor.value.phone);
                array.unshift(cursor.value.firstName);
                array.unshift(cursor.value.lastName);
                cursor.continue();
            }
            else if (dbName == "TaskInfo") {
                array.unshift(cursor.value.task);
                cursor.continue(); 
            }
        }
    }
}

function changeDetails(dbName) {
    var request = indexedDB.open(dbName, 2);
    request.onerror = (event) => {
        console.error("Cannot open " + dbName)
    }
    request.onsuccess = (event) => {
        var db = event.target.result;
        var transaction = db.transaction(dbName, "readwrite");
        var store = transaction.objectStore(dbName);
        store.openCursor().onsuccess = (event) => {
            var cursor = event.target.result; 
            if (dbName == "HostInfo") { //this conditional statement changed general event details
               if(cursor.value.eventDate != $("#eventDate").val()) {
                    cursor[eventDate] = $("#eventDate").val();
                    cursor.continue();
               }
               else if (cursor.value.eventType != $("#eventType").val()) {
                cursor[eventType] = $("#eventType").val();
                cursor.continue();
                }
                else if (cursor.value.inviteType != $("#inviteType").val()) {
                    cursor[inviteType] = $("#inviteType").val();
                    cursor.continue();
                }
                else if (cursor.value.address != "none" || cursor.value.address != $("#hostAddress").val()) {
                    cursor[address] = $("#hostAddress").val();
                    cursor.continue();
                }
            }
            else if (dbName == "TaskInfo") {
                cursor.continue(); 
            }
        }
    }
}

//this function clears input fields baed on an array of input ids
function clearInputFields(inputFields) {
    inputFields.forEach((element) => $(element).val('') )
}

//this function just changes some of the inputs to readOnly after initial information is added depending on database 
function additionReadOnly(inputFields, boolean) {
    if (boolean === true) {
        inputFields.forEach((element) => $(element).prop('readonly', true));
    }
    else {
        inputFields.forEach((element) => $(element).prop('readwrite', true));
    }
}

//this function clears tables by the index
function clearTableBydbName (dbName) {
    var indexTable = "#" + dbName + "Table";
    $(indexTable).find("tr:gt(0)").remove();
    console.log(dbName + " table cleared");
}

//this function converts datetime-local to a readible date
function dtLocalTDate(date) {
    var eTime = new Date(date)
    var DayWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][eTime.getDay()];
    var DayMonth = ["January","February","March","April","May","June","July","August","September","October",
    "November","December"][eTime.getMonth()];
    var DayDay = eTime.getDate().toString();
    var DayYear = eTime.getFullYear().toString();
  
    //this section converts time of day from military time to standard time,  <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.9.0/moment.js"></script> in html is required
    var mTime = eTime.toString();
    var mtsTime = mTime.slice(16, 21);
    var sTime = moment(mtsTime, 'HH:mm').format('h:mm A');

    var eventDate =  DayWeek + ", " + DayMonth + " " + DayDay + ", " + DayYear + " at " + sTime;
    return eventDate;
}

//this function alerts the user in the website if they don't fill out all fields of a form
function errorAddAlert() {
    alert("cannot save information, please make sure all fields are filled out before submitting");
}
//this function makes the first letter of a string uppercase
function UpperCase (string) {
    return string[0].toUpperCase() + string.substring(1);
}

//function combines two arrays together to create an object
function createObjectFromArrays(keys, values) {
    //if these two are not equal legnths, then an object cannot be created
    let result = {};
    let length = Math.min(keys.length, values.length);
    for (let i = 0; i < length; i++) {
        result[keys[i]] = values[i];
    }
    return result;
}
    
function collectData(dbName) {
        if (dbName == "HostInfo") {
            if ($("hostAddressWExp").is(":visible")) {var hostAddress = document.getElementById("hostAddress").value;}
            else {var hostAddress = "none";}
            if($("eventNameWExp").is(":visible")) {var eventName = document.getElementById("eventName").value;}
            else { var eventName = "none";}
            
            var data = {
                "phone": document.getElementById("hostPhone").value,
                firstName: document.getElementById("hostFName").value,
                lastName: document.getElementById("hostLName").value,
                email: document.getElementById("hostEmail").value,
                eventName: eventName,
                eventType: document.getElementById("eventType").value,
                eventDate: document.getElementById("eventDate").value,
                inviteType: $('input[name="inviteSelect"]:checked').val(),
                address: hostAddress
            }

    
            return data
        }
        else if (dbName == "GuestInfo") {
            var data = {
                "phone": document.getElementById("hostAddress").value,
            
            }
            return data
        }
       else if (dbName == "TaskInfo") {
            var data = {
                "date":  document.getElementById("hostAddress").value,
            }
            return data
        }
        else {
            console.error("No data/index to select")
        }
    }

//switches from welcome of each databas to the table element
function switchTable(dbName) {
    if (dbName == "HostInfo") {
        clearInputFields(["#hostFName", "#hostLName", "#hostPhone", "#hostEmail"]);
        additionReadOnly(["#eventType, #eventDate, #InviteType, #hostAddress"], true)
        //this changes the event input field to read only unless change event details button is clicked
        $("#welcomeMsg").slideUp("slow");
        //these two make the transition from the welcome message to adding another a host
        $("#editHostDiv").slideDown("slow");
        }
}

function additional_info_slide(id1, condition, id2) {
    $(id1).change(function(){
        if($(id1).value == condition) {
        $(id2).slideDown("slow");
        }
    });
}

    
window.onload = (event) => {
        //This hides some div and element within the hostDiv
        $("#reqEmailPhoneExp, #hostAddressWExp, #editHostDiv, #eventNameWExp, #changeEventDetailsButton, #additionalHostButton").hide();
        /*This sets up the autocomplete for the event inputs*/
        const eventTypes = ["Wedding", "Birthday Party", "Sleepover/Slumber Party",
        "Child's Birthday Party", "Dinner Party", "Game Night", "Costume Party", 
        "Work Event", "Tailgate", "Game Watch Party", "Rehersal Dinner", 
        "Bachelor/ette Party", "Holiday Party", "Pool Party", "Theme Party", 
        "Coming of Age Party", "Housewarming Party", "Other", "Bar/Bat Mitzvah",
        "Barbecue (BBQ)", "Baby Shower", "Quinceanera", "Funeral", "Cocktail Party", "Dance Party"];
        eventTypes.sort();
        $("#eventType").autocomplete({
            source: eventTypes
        });

        var searchHost = [];
        $("#searchHost").autocomplete({
            source: searchHost
        })

        /*This validates phone numbers by selecting the class of the phone number input*/
        const input = document.querySelector("#phone");
        window.intlTelInput(input, {
            utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js",
        });

        $("#reqEmailPhoneBtn").click(function(){
        $("#reqEmailPhoneExp").toggle('slow');});

        $("#addEventName").click(function(){
        $("#eventName").toggle('slow');});

        $("#submit_invite_button").click(function(){
            console.log($('input[name="inviteSelect"]:checked').val())
          if ( $('input[name="inviteSelect"]:checked').val() != "electronic_invites")  {
            $("#hostAddressWExp").toggle('slow')
          }
        })

        additional_info_slide("#eventNameSelect", "eventName", "#eventNameWExp")
        additional_info_slide("#InviteType",  "paperInviteSelect" || "bothInviteSelect", "#hostAddressWExp")

        /*
        These functions below set up the event listeners for host information
        */
        var HostInfoExist = itemDB("HostInfo");
        print(HostInfoExist);
        $("#host_info_cont").on("click", function(){
            var hostData = collectData("HostInfo"); 
            addToIndex("HostInfo", hostData);//need to add this
            addToSearch("HostInfo", searchHost);
            switchTable("HostInfo");
        });

        $("#showHostButton").on("click", function (){displayList("HostInfo");});
       
        $("#deleteHostButton").on("click", function(){
            var hostKey = document.getElementById("searchHost").value;
            deleteByKey("HostInfo", hostKey, searchHost);
            clearInputFields(["#searchHost"]);
        })
        $("#clearHostButton").on("click", function() {(clearDatabase("HostInfo"))});
        $("#chngEveDetBtn").on("click", function(){additionReadOnly(
            ["#eventType, #eventDate, #InviteType, #hostAddress"], false)})

    };
