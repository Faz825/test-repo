// Callcenter status

const UserMode = {
    "ONLINE": {VALUE: 1, TITLE: 'ONLINE'},
    "OFFLINE": {VALUE: 2, TITLE: 'OFFLINE'},
    "WORK_MODE": {VALUE: 3, TITLE: 'WORK-MODE'}
};

const CallType = {
    "INCOMING": 1,
    "OUTGOING": 2
};

const ContactType = {
    "INDIVIDUAL": 1,
    "GROUP": 2,
    "MULTI": 3
};

const CallStatus = {
    "MISSED": 1,
    "ANSWERED": 2,
    "REJECTED": 3, /* call rejected due to targeted user work-mode */
    "CANCELLED": 4 /* call hanged-up by targeted user */
};

const CallChannel = {
    VIDEO: 1,
    AUDIO: 2
};

export {UserMode, ContactType, CallStatus, CallType, CallChannel};