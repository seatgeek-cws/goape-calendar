import "core-js/stable";
import "regenerator-runtime/runtime";
import "whatwg-fetch";

let events;
let eventDates = [];
let cache = []; //TODO: Update cache to include year
let initialLoad = true;
let plzwait = false;

// populate values from URL
// TODO: populate values from HTTP URL Request
const showId = '8a4e7b03-893e-e911-80e8-00505601004c';
const url = 'https://uat-bookings.goape.co.uk/BatterseaPark/';

const today = new Date();
//TODO: Ensure all dates are in a format for IE
const startDate = today.getFullYear() + "-06-01";
const endDate =  today.getFullYear() + "-06-31"

getJsonFeed(startDate, endDate);
function getJsonFeed(fromDate, toDate) {
    console.log(fromDate);
    const month = new Date(fromDate).getMonth();
    console.log(month);
    const year = new Date(fromDate).getFullYear();
    console.log("getting feed");
    let checkMonth = $.inArray(month, cache) === -1;
    console.log (checkMonth, month);
    if (checkMonth && (month < 12)) {
        Promise.resolve(
            jQuery.ajax({
                type: "GET",
                cache: true,
                url: url + "feed/events?json&showid=" + showId + "&fromdate=" + fromDate + "&todate=" + toDate + "&compact&disconnect=true",
                dataType: "json",
                jsonp: false,
                timeout: 10000,
                pleaseWaitDelay: false
            })
        ).then(function (response) {
            cache.push(month);
            console.log('got feed', response);
            let lastDay = lastDayOfMonth(year, month + 2);
            let newFrom = year + '-' + (month + 2) + '-' + '01';
            let newTo = year + '-' + (month + 2) + '-' + lastDay;
            mapEventDates(response);
            getJsonFeed(newFrom, newTo);
        }).catch(function (e) {
            console.log("error geting feed: " + e.statusText, e);
        });
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
        waitEnd();
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
    getEventsAvailability(date, date);
}

function getEventsAvailability(fromDate, toDate) {
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
    if ($.inArray(month, cache) !== -1) {
        $('.date_picker').datepicker("refresh");
    } else {
        pleaseWait();
    }
}

function lastDayOfMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

function pleaseWait() {
    plzwait = true;
    $('.message-container h2').text("Please wait ....");
}

function waitEnd() {
    if (plzwait) {
        plzwait = false;
        $('.message-container h2').text("Loaded");
        $('.date_picker').datepicker("refresh");
    }
}