// Callcenter status

const UserMode = {
    "ONLINE": {VALUE: 1, TITLE: 'Online'},
    "OFFLINE": {VALUE: 2, TITLE: 'Offline'},
    "WORK_MODE": {VALUE: 3, TITLE: 'Work-mode'}
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
    "VIDEO": 1,
    "AUDIO": 2
};

const CallStage = {
    "DIAL_CALL": 1,
    "CREATE_CALL": 2,
    "ANSWER_CALL": 3
};

const Bit6CallState = {
    "OUTGOING": {
        "DIAL": "req",
        "ANSWER": "got-answer",
        "END": "sent-bye",
        "END_BY_OTHER": "got-bye",
        "RENEGOTIATION": "got-offer"
    },
    "INCOMING": {
        "INCOMING": "pre-answer",
        "ANSWER": "sent-answer",
        "END": "sent-bye",
        "END_BY_OTHER": "got-bye",
        "RENEGOTIATION": "got-offer"
    }
};

export {UserMode, ContactType, CallStatus, CallType, CallChannel, Bit6CallState, CallStage};