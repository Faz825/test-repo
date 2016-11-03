/**
 * Created by gihan on 10/26/16.
 */

var CalenderEventHandler = {
    init:function() {

        var schedule = require('node-schedule');

        // 0 0 0/8 * * ? - run on every 8 hours

        var j = schedule.scheduleJob('0 0 0/8 * * ?', function(){

            var _async = require('async'),
                CalenderEvent = require('mongoose').model('CalenderEvent'),
                moment = require('moment');

            console.log("***************************************************");
            console.log("------------ START SCHEDULE ---- @ " + moment().format('YYYY-MM-DD HH:mm:ss'));
            console.log("***************************************************");


            _async.waterfall([
                function getAllForTheDay(callBack){

                    var day = new Date();
                    var startTimeOfDay = moment(day).format('YYYY-MM-DD'); //format the given date as mongo date object
                    var endTimeOfDay = moment(day).add(1,"day").format('YYYY-MM-DD'); //get the next day of given date
                    var criteria =  { start_date_time: {$gte: startTimeOfDay, $lt: endTimeOfDay }, status: 1};

                    CalenderEvent.getSortedCalenderItems(criteria,function(err, result) {
                        callBack(null, result.events);
                    });
                },
                function getMovableEventsList(eventsList, callBack){

                    if(typeof eventsList != "undefined" && eventsList.length > 0) {
                        console.log("eventsList.length--"  + eventsList.length);

                        var movableList = [];
                        for(var i in eventsList) {
                            var _date = moment(eventsList[i].start_date_time);
                            //var _time = eventsList[i].event_time;
                            //if(typeof _time != 'undefined' && _time) {
                            //    var splitTime = _time.split(":");
                            //    _date.add(splitTime[0], 'h');
                            //    _date.add(splitTime[1], 'm');
                            //}

                            var now = moment().utc();

                            //var combined_date = moment(_date + ' ' + _time, "YYYY-MM-DD HH:mm");
                            var eventTimeFromUserZone = moment(_date).format('YYYY-MM-DD HH:mm:ss');
                            var nowTimeFromUserZone = moment(now).utcOffset(eventsList[i].event_timezone).format('YYYY-MM-DD HH:mm:ss');

                            console.log("eventTimeFromUserZone--"+eventTimeFromUserZone);
                            console.log("nowTimeFromUserZone--"+nowTimeFromUserZone);

                            if(nowTimeFromUserZone > eventTimeFromUserZone){
                                movableList.push(eventsList[i]);
                            }
                        }
                        callBack(null, movableList);
                    } else {
                        callBack(null, null);
                    }
                },
                function moveToNextDay(movableList, callBack){

                    if(typeof movableList != "undefined" && movableList) {
                        console.log("movableList.length--"  + movableList.length);

                        for(var i in movableList) {
                            var criteria={
                                _id:movableList[i]._id
                            };
                            var updateData = {
                                start_date_time:moment(movableList[i].start_date_time).add(1,"day").format('YYYY-MM-DD HH:mm:ss')
                            };
                            CalenderEvent.updateEvent(criteria, updateData,function(res) {
                                callBack(null,res);
                            });
                        }
                    } else {
                        callBack(null);
                    }
                }
            ], function(err) {
                console.log("----------------- END SCHEDULE ------------------");
                console.log("***************************************************");
            });

        });

    }

};

module.exports = CalenderEventHandler;