console.log("fetching data from feed again");
let eventDataForThisMonth;
let eventDates = [];

getJsonFeed("mapEventsData");

function getJsonFeed(callback) {
    jQuery.ajax(
        {
            type: "GET",
            url: "https://bookings.goape.co.uk/BatterseaPark/feed/eventsavailability?json&callback=" + callback + "&showid=8a4e7b03-893e-e911-80e8-00505601004c&fromdate=2019-06-03&todate=2019-06-30",
            dataType: "jsonp",
            jsonp: false,
            jsonpCallback: callback,
            success: function (response) {
                console.log(response); // server response
                mapEventDates(response);
            }
        }
    );
}

function mapEventDates(callback) {
    let events = callback.feed.data.Events.Event;
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
        //"onSelect": onSelect,
        //"onChangeMonthYear": onChangeMonthYear,
        "dateFormat": "yy-mm-dd",
        dayNamesMin: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        firstDay: 1
    });
}

function beforeShowDay(date) {
    return [$.inArray(date.valueOf(), eventDates) + 1, "has-events"];
}