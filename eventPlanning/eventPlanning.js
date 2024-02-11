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
        }
        else if (dbName == "GuestInfo") {
            const objectStore = db.createObjectStore("GuestInfo", {keyPath: "phone"});
            objectStore.createIndex("phone", "phone", {unique: true});
        }
        else if (dbName == "TaskInfo") {
            const objectStore = db.createObjectStore("TaskInfo", {keyPath: "date"});
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
            update_calander(dbName)
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
            if (req.result == 1) {
                if (dbName == "HostInfo") {$("#hostCount").text("There is "
                 + req.result + " host for your event");}
                else if (store == "GuestInfo") {}
                else if (store == "TaskInfo") {}  
                else {}
            }
            else {
                if (dbName == "HostInfo") { $("#hostCount").text("There are " + req.result + " hosts for your event")}
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
                    var listEventDate = dtLocalTDate(cursor.value.eventDate); 
                    var invitationType = remove_underscores(cursor.value.inviteType)
                    console.log(invitationType)
                    cursor.continue(); 
                    if (cursor.value.address === "none" && cursor.value.eventName === "none") {
                        var eventTableHeaders = ["Event Type ", "Event Date ", "Invite Type "]
                        var eventDetails = [cursor.value.eventType, listEventDate, invitationType]
                    } 
                    else if (cursor.value.eventName !== "none" && cursor.value.address === "none") {
                        var eventTableHeaders = ["Event Name ", "Event Type ", "Event Date ", "Invite Type "]
                        var eventDetails = [cursor.value.eventName, cursor.value.eventType, listEventDate, 
                            invitationType]
                    }
                    else if (cursor.value.eventName === "none" && cursor.value.address !== "none") {
                        var eventTableHeaders = ["Event Type ", "Event Date ", "Invite Type ", 
                        "Invitation Return Address "]
                        var eventDetails = [cursor.value.eventType, listEventDate, invitationType,
                             cursor.value.address]
                    }
                    else {
                        var eventTableHeaders = ["Event Name ", "Event Type ", "Event Date ", "Invite Type ",
                         "Invitation Return Address "]
                        var eventDetails = [cursor.value.eventName, cursor.value.eventType, listEventDate,
                             invitationType, cursor.value.address]
                    }   
                    //combines two arrays and creates a key value pair. key = eventTableHeaders value = eventDetails
                    var eventObject = createObjectFromArrays(eventTableHeaders, eventDetails);

                    for (const key in eventObject) {
                        $("#eventDetailsTable").append('<tr><td>'+ key + '</td><td>' + eventObject[key] + '</td></tr>');
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

function getAddressType(dbName) {
    var request = indexedDB.open(dbName, 2);
    request.onerror = (event) => {
        console.error("Cannot open index to display")
    }
    request.onsuccess = (event) => {
        var db = event.target.result;
        var transaction = db.transaction(dbName, "readonly");
        var store = transaction.objectStore(dbName);
        store.openCursor().onsuccess = (event) => {
            var cursor = event.target.result; 
            if (cursor) {
                if (dbName == "HostInfo") {
                    return cursor.value.inviteType
                    } 
                else if (store == "GuestInfo") {

                }
                else if (store == "TaskInfo") {
    
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
    const date_options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    console.log(date)
    var eventTime = eTime.toLocaleTimeString(navigator.language)
    var eventDate = eTime.toLocaleDateString(navigator, date_options)

    return eventDate + " at " + eventTime;
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

// returns a string with spaces instead of underscores 
function remove_underscores(string) {
    return string.replaceAll('_', ' ')

}

function update_calander(dbName) {
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
            console.log("cursor:", cursor)
        }}

    date = cursor.value.eventDate
    console.log(date)
    var startTime = new Date(date);
    //this converts the date to a string so we can splice the start time and time zone values to AddCalander
    var sTime = startTime.toString();
    var evTime = sTime.slice(0, 24);
    var evTimeZone = sTime.slice(25, 33);

    var eType = getReq.result.eventType;
    //depending on the event type, this determine the hours for specific events(ex. child's party = 2 hours, dinner party = 3 hours)
    var eventLegnth = function(dbName, eType){
        if (dbName == "HostInfo") {
            eType = cursor.value.eventType
            if (eType == "Child's Birthday Party" || eType == "Work Event" || eType == "Child's Birthday Party") {
                return 2;
            }
            else if (eType == "Wedding" || eType == "Coming of Age Party" || eType == "Quinceanera" || eType == "Bar/Bat Mitzvah") {
                return 6;
            }
            else if (eType == "Dinner Party" || eType == "Holiday Party" ||
                eType == "Birthday Party" || eType == "Pool Party" || eType == "Theme Party" || 
                eType == "Rehersal Dinner" || eType == "Costume Party" || eType == "Housewarming Party") {
                return 3
            }
            else if (eType == "Game Watch Party" || eType == "Game Night" || eType == "Tailgate") {
                return 4
            }
            else {
                return 24
            }
        }
    }
            
    //this converts the date to a string so we can splice the end time to AddCalander
                var endTime = startTime.setHours(startTime.getHours() + eventLegnth);
                var TEnd = new Date(endTime);
                var eTime = TEnd.toString();
                var eDate = eTime.slice(0, 24);

                if (dbName == "Host_Info") {
                    $("#event_start").html = sTime;
                    $("#event_end").html = eDate;
                    $("#event_timezone").html = evTimeZone;
                    $("#event_name").html = cursor.value.eventName;
                    $("#organizer_email").html = cursor.value.

                document.getElementById("EventStart").innerHTML = evTime;
                document.getElementById("EventEnd").innerHTML = eDate;
                document.getElementById("timezone").innerHTML = evTimeZone;
                document.getElementById("EventTypeCal").innerHTML = eType;
                }

                
                
    

}

function open_cursor(dbName) {
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
            console.log("cursor:", cursor)
            return cursor
        }
    }
}

function searchCursor(dbName, search_term){
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

        }
    }
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
                eventDate: document.getElementById("event_date").value,
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
        $("#editHostDiv").slideDown("slow");
        $("#welcomeMsg, #eventDetails, #hostContact").slideUp("slow");
        $("#continue_host", "#hostContact", "#eventDetails").hide();
        $("#hostContact").appendTo("#addAdditionalHost");
        $("#eventDetails").appendTo("#editEventDetails");
        }
}
    
window.onload = (event) => {
        //This hides some div and element within the hostDiv
        $("#reqEmailPhoneExp, #hostAddressWExp, #editHostDiv, #eventNameWExp, #changeEventDetailsButton, #additionalHostButton, #guestDiv").hide();
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
        var input = document.querySelector("#hostPhone, #guestPhone");
        window.intlTelInput(input, {
            utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js",
        });

        $("#reqEmailPhoneBtn").click(function(){
        $("#reqEmailPhoneExp").toggle('slow');});

        $("#addEventName").click(function(){
        $("#eventName").toggle('slow');});

        $("#addEventChangesButton").click(function(){
        $("#eventDetails").toggle('slow')});

        $("#addHostContacts").click(function(){
        $("#hostContact").toggle('slow')});

        $("#submit_invite_button").click(function(){
            if ( $('input[name="inviteSelect"]:checked').val() != "electronic_invites")  {
                $("#hostAddressWExp").toggle('slow')
            }
        })

        /*
        These functions below set up the event listeners for host information
        */
        var HostInfoExist = itemDB("HostInfo");
        $("#host_continue").on("click", function(){
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

        $("#guest_continue").on("click", function(){
            $("#hostDiv").slideUp("slow");
            $("#guestDiv").slideDown("slow");
            event_invite_type = getAddressType("HostInfo");
            if (event_invite_type == "electronic_invites") {
                $("#guest_address_div").hide();
            }
            $("#reqEmailPhoneBtnGuest").click(function(){
                $("#reqEmailPhoneExpGuest").toggle('slow');});
        })
        $("#back_to_hosts").on("click", function(){
            $("#hostDiv").slideDown("slow")
            $("guestDiv").slideUp("slow")
        })

    };
