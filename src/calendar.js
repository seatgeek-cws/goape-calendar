/* Quick edits */
//showId = '8a4e7b03-893e-e911-80e8-00505601004c';
//url = 'https://uat-bookings.goape.co.uk/BatterseaPark/';
import "core-js/stable";
import "regenerator-runtime/runtime";
import "whatwg-fetch";

const url_string = window.location.href;
const url_obj = new URL(url_string);
const showId = url_obj.searchParams.get('showid');
const show = url_obj.searchParams.get('adv');
const location = url_obj.searchParams.get('loc');
const site = url_obj.pathname.split('/')[1];
const url = 'https://' + url_obj.host + '/' + site + '/';
const preloadMonths = 3;
const times = document.getElementById('times');
const eventTimesContainer = document.getElementsByClassName('event-times')[0];

console.log(times, eventTimesContainer);

const today = new Date();
const startDate = today.getFullYear() + "-" + (("0" + (today.getMonth() + 1)).slice(-2)) + "-" + "01";
const endDate = today.getFullYear() + "-" + (("0" + (today.getMonth() + 1)).slice(-2)) + "-" + lastDayOfMonth(today.getFullYear(), today.getMonth() + 1);

let plzwait = false;
let events;
let eventDates = [];
let cache = [];
let monthsAdded = 0;

// Initial call of Feeds
getJsonFeed(startDate, endDate);
const title = document.getElementsByClassName('event-title')[0];
title.innerHTML = '<h2>' + show + ' - ' + location + '</h2>';

function getJsonFeed(fromDate, toDate) {
    const month = new Date(fromDate).getMonth();
    const year = new Date(fromDate).getFullYear();
    const checkMonth = $.inArray(month, cache) === -1;

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
            monthsAdded++;
            console.log("feed retrieved");

            if (response.feed.EventsCount > 0)
                mapEventDates(response);

            waitEnd();
            
            let newMonth = (month === 11) ? 0 : month + 1;
            let newYear = (month === 11) ? year + 1 : year;
            
            if (monthsAdded < preloadMonths && $.inArray(newMonth, cache) === -1) {
                console.log("loading new feed");
                let lastDay = lastDayOfMonth(newYear, newMonth + 1);
                let newFrom = newYear + '-' + (("0" + (newMonth + 1)).slice(-2)) + '-' + '01';
                let newTo = newYear + '-' + (("0" + (newMonth + 1)).slice(-2)) + '-' + lastDay;  
                console.log(newFrom, newTo);
                getJsonFeed(newFrom, newTo);
            }
        }).catch(function (e) {
            console.log("error geting feed: " + e.statusText, "Error message: ", e.message, e);
        });
    } else {
        waitEnd();
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
    

    if (!legend) {
        $('.time-legend').show();
        legend = true;
    }

    while (eventTimesContainer.firstChild) {
        eventTimesContainer.removeChild(eventTimesContainer.firstChild);
    }

    let eventsAvailablity = eventFeed.feed.data.Events.Event;
    for (let i = 0; i < eventsAvailablity.length; i++) {
        const eventLink = document.createElement('div');
        const availableCapacity = parseInt(eventsAvailablity[i].AvailableCapacity, 10);
        const timeWithSeconds = eventsAvailablity[i].ActualEventDate.split('T')[1];
        const time = timeWithSeconds.split(':', 2).join(':');

        if (availableCapacity === 0) {
            eventLink.innerHTML = '<div class="slot"><div class="time">' + 
                time + '</div><div class="capacity">' + 
                eventsAvailablity[i].AvailableCapacity + ' spaces' +
                '</div></div>';
            eventLink.classList.add('timeslot');
            eventLink.classList.add('SoldOut');
        } else {
            eventLink.innerHTML = '<a href=' + url + 'loader.aspx/?target=hall.aspx%3Fevent%3D' + 
                eventsAvailablity[i].EventLocalId + '>' + 
                '<div class="slot"><div class="time">' + 
                time + 
                '</div><div class="capacity">' + 
                eventsAvailablity[i].AvailableCapacity + ' spaces'
                '</div></div></a>';

            let eventClass;
            if (availableCapacity <= 4)
                eventClass = "HighSeatsOccupancy";
            else
                eventClass = "LowSeatsOccupation";
            eventLink.classList.add('timeslot');
            eventLink.classList.add(eventClass);
        }
        
        fragment.appendChild(eventLink);
    }

    eventTimesContainer.appendChild(fragment);
    times.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
}

function clearTimes() {
    while (eventTimesContainer.firstChild) {
        eventTimesContainer.removeChild(eventTimesContainer.firstChild);
    }
}

function onChangeMonthYear(year, month, inst) {
    clearTimes();
    console.log("onChangeMonth: ", monthsAdded);
    if ($.inArray(month - 1, cache) !== -1) {
        $('.date_picker').datepicker("refresh");
    } else if (month -1 > cache[0]) {
        // On month change add next 1 month to caching queue
        pleaseWait();
        if (monthsAdded === 3) {
            monthsAdded = 0;
            const nextMonth = year + '-' + (("0" + (month)).slice(-2)) + '-' + '01';
            const endOfMonth = year + '-' + (("0" + (month)).slice(-2)) + '-' + lastDayOfMonth(year, month);
            console.log(nextMonth, endOfMonth);
            getJsonFeed(nextMonth, endOfMonth);
        }
    }
}

function lastDayOfMonth(year, month) {
    console.log("cache test");
    const newDate = new Date(year, month, 0);
    return ("0" + newDate.getDate()).slice(-2);
}

function pleaseWait() {
    plzwait = true;
    pleaseWaitDlg = showPleaseWait();
}

function waitEnd() {
    plzwait = false;
    window.hidePleaseWait();
    $('.date_picker').datepicker("refresh");
}


