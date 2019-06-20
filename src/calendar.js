//TODO: CORS is messing with this when you don't use the callback, checek on live server
let events;
let eventDates = [];
let cache = [];
let initialLoad = true;

// populate values from URL
const showId = '8a4e7b03-893e-e911-80e8-00505601004c';
const url = 'https://bookings.goape.co.uk/BatterseaPark/';

//TODO: Create start date of first event
getJsonFeed("callbackx", "2019-06-01", "2019-06-30");
function getJsonFeed(callback, fromDate, toDate) {
    let month = new Date(fromDate).getMonth();
    let year = new Date(fromDate).getFullYear();
    // TODO: Activate please wait
    if (($.inArray(month, cache) === -1) && (month < 12)) {
        let eventFeedURL = url + "feed/events?json&showid=" + showId + "&fromdate=" + fromDate + "&todate=" + toDate + "&compact&disconnect=true";
        fetch(eventFeedURL)
            .then((response) => response.json())
            .then((responseJson) => {
                cache.push(month);
                let lastDay = lastDayOfMonth(year, month + 2);
                let newFrom = year + '-' + (month + 2) + '-' + '01';
                let newTo = year + '-' + (month + 2) + '-' + lastDay;
                mapEventDates(responseJson);
                getJsonFeed("callbackx", newFrom, newTo);
            })
            .catch((error) => {
                console.log(error);
            })
    }
}

function mapEventDates(callback) {
    events = callback.feed.Events.Event;
    let tempEventDates = [];
    for (let i = 0; i < events.length; i++) {
        tempEventDates.push((new Date(events[i].ActualEventDate)).setHours(0, 0, 0, 0).valueOf());
    }

    if (eventDates.length > 0) {
        let mergedSet = [...new Set([...eventDates, ...tempEventDates])];
        eventDates = mergedSet;
    } else {
        eventDates = [...new Set(tempEventDates)];
        setupDatePicker();
    }
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
    let eventsURL = url + "feed/eventsavailability?json&showid=" + showId + "&fromdate=" + fromDate + "&todate=" + toDate;
    fetch(eventsURL)
        .then((response) => response.json())
        .then((responseJson) => {
            buildTimeSlotsUI(responseJson);
        })
        .catch((error) => {
            console.log(error);
        })
}

function buildTimeSlotsUI(eventFeed) {
    console.log("building events", eventFeed);
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
    $('.date_picker').datepicker("refresh");
}

function lastDayOfMonth(year, month) {
    return new Date(year, month, 0).getDate();
}