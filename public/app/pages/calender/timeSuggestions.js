import { fromJS } from 'immutable';


let timeArr = [];
for (var i = 0; i <= 23; i++) {
    for (var j = 0; j <= 59; j = j+30) {

        var nameHr = i;
        if(i>12) {
            nameHr = i-12;
        }else if (i=0) {
            nameHr = 12;
        }
        var timeLable = (i>11) ? 'PM' : 'AM';

        let timeObj = {
            name : String("0" + nameHr).slice(-2)+'.'+String("0" + j).slice(-2)+' '+timeLable,
            value : String("0" + i).slice(-2)+':'+String("0" + j).slice(-2),
            title : '',
            avatar : '/images/clock.png',
        }
        timeArr.push(timeObj);
    }
}

const mentions = fromJS(timeArr);

export default mentions;
