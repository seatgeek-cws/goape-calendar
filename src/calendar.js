//TODO: CORS is messing with this when you don't use the callback, checek on live server

let events;
let eventDates = [];
const showId = '8a4e7b03-893e-e911-80e8-00505601004c';
const url = 'https://bookings.goape.co.uk/BatterseaPark/feed';

getJsonFeed("test", "2019-06-03", "2019-06-30");

function getJsonFeed(callback, fromDate, toDate) {
    // TODO: Activate please wait
    Promise.resolve(
        jQuery.ajax({
            type: "GET",
            url: url + "/events?json&full&callback=" + callback + "&showid=" + showId + "&fromdate=" + fromDate + "&todate=" + toDate,
            dataType: "jsonp",
            jsonp: false,
            jsonpCallback: callback,
            timeout: 10000
        })
    ).then(function (response) {
        console.log(response); // server response
        mapEventDates(response);
    }).catch(function (e) {
        console.log("error geting feed: " + e.statusText);
    });
}

function mapEventDates(callback) {
    events = callback.feed.Events.Event;
    let tempEventDates = []
    for (let i = 0; i < events.length; i++) {
        tempEventDates.push((new Date(events[i].ActualEventDate)).setHours(0, 0, 0, 0).valueOf());
    }
    eventDates = [...new Set(tempEventDates)];
    setupDatePicker();
}

function setupDatePicker() {
    $.datepicker.setDefaults($.datepicker.regional['']);
    $('.date_picker').datepicker({
        "beforeShowDay": beforeShowDay,
        "onSelect": onSelect,
        //"onChangeMonthYear": onChangeMonthYear,
        "dateFormat": "yy-mm-dd",
        dayNamesMin: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        firstDay: 1
    });
}

function beforeShowDay(date) {
    return [$.inArray(date.valueOf(), eventDates) + 1, "has-events"];
}

function onSelect(date) {
    console.log("dates selected");
    console.log(date);
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

    getEventsAvailability("callbackx", date, date);
}

function getEventsAvailability(callback, fromDate, toDate) {
    Promise.resolve(
        jQuery.ajax({
            type: "GET",
            url: url + "/eventsavailability?json&callback=" + callback + "&showid=" + showId + "&fromdate=" + fromDate + "&todate=" + toDate,
            dataType: "jsonp",
            jsonp: false,
            jsonpCallback: callback,
            timeout: 10000
        })
    ).then(function (response) {
        console.log(response); // server response
    }).catch(function (e) {
        console.log("error geting feed: " + e.statusText);
    });
}

// Useless method
function callbackx(result) {
    console.log("callbackx" + result);
}