const url_string = window.location.href;
const url_obj = new URL(url_string);
const showId = url_obj.searchParams.get('showid');
const site = url_obj.pathname.split('/')[1];

const url = 'https://' + url_obj.host + '/' + site + '/';

let events;
let eventDates = [];
let cache = []; //TODO: Update cache to include year
let initialLoad = true;
let plzwait = false;

const today = new Date();
const startDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + "01";
const endDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + lastDayOfMonth(today.getFullYear(), today.getMonth() + 1);

getJsonFeed(startDate, endDate);
function getJsonFeed(fromDate, toDate) {
    const month = new Date(fromDate).getMonth();
    const year = new Date(fromDate).getFullYear();

    let checkMonth = $.inArray(month, cache) === -1;

    //FIXME: Time out on last month selection: https://uat-bookings.goape.co.uk/WoburnSafariPark/custom/calendartest.aspx?showid=6d8f7883-3140-e911-80e8-00505601004c&interface=37
    //FIXME: Time out if going back a month where no events present
    if (checkMonth && (month < 13)) {
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
            let lastDay = lastDayOfMonth(year, month + 2);
            let newFrom = year + '-' + (month + 2) + '-' + '01';
            let newTo = year + '-' + (month + 2) + '-' + lastDay;
            mapEventDates(response);
            waitEnd();
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
    //FIXME: When month has no events it timesout
    
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
    pleaseWaitDlg = showPleaseWait();
}

function waitEnd() {
    plzwait = false;
    hidePleaseWait();
    $('.date_picker').datepicker("refresh");
}

$.fn.scrollView = function () {
    return this.each(function () {
        $('html, body').animate({
            scrollTop: $(this).offset().top
        }, 1000);
    });
}