import { fromJS } from 'immutable';

let timeArr = [];
for (var i = 0; i <= 23; i++) {
    var nameHr = i;
    if(i>12) {
        nameHr = nameHr-12;
    }
    if (i===0) {
        nameHr = 12;
    }

    var timeLable = (i>11) ? 'PM' : 'AM';
    for (var j = 0; j <= 59; j = j+30) {
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
