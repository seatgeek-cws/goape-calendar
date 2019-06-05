console.log("fetching data from feed again");
let eventDataForThisMonth;

getJsonFeed("mapEventsData");

function getJsonFeed(callback) {
    jQuery.ajax(
        {
            type: "GET",
            url: "https://bookings.goape.co.uk/BatterseaPark/feed/eventsavailability?json&callback=" + callback + "&showid=8a4e7b03-893e-e911-80e8-00505601004c&fromdate=2019-06-03&todate=2019-06-30",
            dataType: "jsonp",
            jsonp: false,
            jsonpCallback: callback,
            success: function(response) {
                console.log(response); // server response
                mapEventDates(response);
            }
        }
    );
}

function mapEventDates(callback) {
    let events = callback.feed.data.Events.Event;
    console.log(events);
}
