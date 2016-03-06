
/**
 * This is date time related lib class that can use any where in the application
 */
'use strict'

var DateTime ={
    getServerTimeStamp :function(){
        return Math.floor(new Date() / 1000);
    },
    timeAgo: function(date) {
        var seconds = Math.floor((new Date() - date) / 1000);
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        if (seconds < 5){
            return "just now";
        }else if (seconds < 60){
            return seconds + " seconds ago";
        }
        else if (seconds < 3600) {
            var minutes = Math.floor(seconds/60)
            if(minutes > 1)
                return minutes + " minutes ago";
            else
                return "1 minute ago";
        }
        else if (seconds < 86400) {
            var hours = Math.floor(seconds/3600)
            if(hours > 1)
                return hours + " hours ago";
            else
                return "1 hour ago";
        }
        //2 days and no more
        else if (seconds < 172800) {
            var days = Math.floor(seconds/86400)
            if(days > 1)
                return days + " days ago";
            else
                return "1 day ago";
        }
        else{

            //return new Date(time).toLocaleDateString();
            return date.getDate().toString() + " " + months[date.getMonth()] + ", " + date.getFullYear();
        }
    },
    /**
     * Explain Date
     * @param date
     * @returns {{time_a_go: *, date_string: string}}
     */
   explainDate:function(date){
        var date = new Date(date);
        var seconds = Math.floor((new Date() - date) / 1000),
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            long_date_str =  date.getDate().toString() + " " + months[date.getMonth()] + ", " + date.getFullYear(),
            short_date_str = date.getDate().toString() + "/" + date.getMonth() + "/" + date.getFullYear();


        return {
            time_a_go:this.timeAgo(date),
            long_date_string:long_date_str,
            short_date_string:short_date_str
        }
    }
}

module.exports = DateTime
