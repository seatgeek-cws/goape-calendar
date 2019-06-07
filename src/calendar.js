//TODO: CORS is messing with this when you don't use the callback, checek on live server
let events;
let eventDates = [];
let initialLoad = true;
let cache = [];

// populate values from URL
const showId = '8a4e7b03-893e-e911-80e8-00505601004c';
const url = 'https://bookings.goape.co.uk/BatterseaPark/';

getJsonFeed("callbackx", "2019-06-01", "2019-06-30");

// Remove Callback references when on server
function getJsonFeed(callback, fromDate, toDate) {
    console.log("getJsonFeed, fromDate: " + fromDate + " toDate: " + toDate);
    // TODO: Activate please wait
    Promise.resolve(
        jQuery.ajax({
            type: "GET",
            cache: true,
            url: url + "feed/events?json&callback=" + callback + "&showid=" + showId + "&fromdate=" + fromDate + "&todate=" + toDate + "&compact&disconnect=true",
            dataType: "jsonp",
            jsonp: false,
            jsonpCallback: callback,
            timeout: 10000
        })
    ).then(function (response) {
        cache.push(response);
        mapEventDates(response);
    }).catch(function (e) {
        console.log("error geting feed: " + e.statusText, e);
    });
}

function lazyLoadNextMonth(date) {
    // Run in background, dont' make a new request if user selects this month
}

function mapEventDates(callback) {
    console.log("mapEventDates", callback);
    events = callback.feed.Events.Event;
    let tempEventDates = [];
    for (let i = 0; i < events.length; i++) {
        tempEventDates.push((new Date(events[i].ActualEventDate)).setHours(0, 0, 0, 0).valueOf());
    }
    eventDates = [...new Set(tempEventDates)];
    initialLoad ? setupDatePicker() : $('.date_picker').datepicker("refresh");
}

function setupDatePicker() {
    $.datepicker.setDefaults($.datepicker.regional['']);
    $('.date_picker').datepicker({
        "beforeShowDay": beforeShowDay,
        "onSelect": onSelect,
        "onChangeMonthYear": onChangeMonthYear,
        "dateFormat": "yy-mm-dd",
        dayNamesMin: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        firstDay: 1
    });
    initialLoad = false;
}

function beforeShowDay(date) {
    return [$.inArray(date.valueOf(), eventDates) + 1, "has-events"];
}

function onSelect(date) {
    getEventsAvailability("callbackx", date, date);
}

function getEventsAvailability(callback, fromDate, toDate) {
    Promise.resolve(
        jQuery.ajax({
            type: "GET",
            cache: true,
            url: url + "feed/eventsavailability?json&callback=" + callback + "&showid=" + showId + "&fromdate=" + fromDate + "&todate=" + toDate,
            dataType: "jsonp",
            jsonp: false,
            jsonpCallback: callback,
            timeout: 10000
        })
    ).then(function (response) {
        buildTimeSlotsUI(response); // server response
        console.log(response);
    }).catch(function (e) {
        // TODO: Handle feed errors and cancel requests of timeouts and canceled sessions
        console.log('error geting feed: ' + e + " status: " + e.statusText);
    });
}

function buildTimeSlotsUI(eventFeed) {   
    let legend = false;
    let fragment = document.createDocumentFragment();
    let eventTimesContainer = document.getElementsByClassName('event-times')[0];

    if (!legend) {
        $('.time-legend').show();
        legend = true;
    }

    while (eventTimesContainer.firstChild) {
        eventTimesContainer.removeChild(eventTimesContainer.firstChild);
    }

    let eventsAvailablity = eventFeed.feed.data.Events.Event;
    for (let i = 0; i < eventsAvailablity.length; i++) {
        let eventLink = document.createElement('div');

        eventLink.innerHTML = '<a href=' + url + 'loader.aspx/?target=hall.aspx%3Fevent%3D' + eventsAvailablity[i].EventLocalId + '>' + '<div class="slot"><div class="time">' + eventsAvailablity[i].ActualEventDate + '</div><div class="capacity">' + eventsAvailablity[i].AvailableCapacity + '</div></a>';
        fragment.appendChild(eventLink);
    }

    eventTimesContainer.appendChild(fragment);
}

function onChangeMonthYear(year, month, inst) {
    console.log("onchangeMonthYear: " + year + month);
    let lastDayOfMonth = new Date(year, month, 0).getDate();
    
    let fromDate = year + '-' + month + '-' + '01';
    let toDate = year + '-' + month + '-' + lastDayOfMonth;
    getJsonFeed("test", fromDate, toDate);
}

// Useless method
function callbackx(result) {
    console.log("callbackx" + result);
}