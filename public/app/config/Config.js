const data = {
    envs: {live: 'LIVE', dev: 'DEV', local: 'LOCAL'},
    live: {
        "PROGLOBE_APP": "//proglobe.us/",
        "PROGLOBE_NOTIFICATION_APP": "//notification.proglobe.us/",
        "BIT6_API_KEY": "18j5x-sRBAbzhTW1ZD"
    },
    dev: {
        "PROGLOBE_APP": "//dev.proglobe.us/",
        "PROGLOBE_NOTIFICATION_APP": "//dev-notification.proglobe.us/",
        "BIT6_API_KEY": "18j5x-sRBAbzhTW1ZD"
    },
    local: {
        "PROGLOBE_APP": "//dev.proglobe.us/",
        "PROGLOBE_NOTIFICATION_APP": "//proglobe_notify.local/",
        "BIT6_API_KEY": "22n7t-0zXi33P9Yap6"
    }
};

/* Developed it this way to avoid code changes occurrences, sources already using  'const Configs',
 Otherwise we can export a func that will eval  'const env' */

const env = data.envs.local;

var Config = {};

switch (env) {
    case 'LIVE':
        Config = data.live;
        break;
    case 'DEV':
        Config = data.dev;
        break;
    case 'LOCAL':
        Config = data.local;
        break;
    default:
        Config = data.dev.dev;
        break;
}

export {Config};





