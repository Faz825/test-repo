/**
 * This class will handle back-end calls & other functions related to call center
 */

import Socket from './Socket';

class CallCenter {

    constructor() {
        this.socket = Socket.socket;
    }

    /**
     * @param aContacts - multiple user-id's or single user-id
     * @param status - status of user (online,offline,work-mode)
     * */
    contactsStatus(aContacts, status) {
        this.socket.emit('contacts status', {contacts: aContacts, status: status});
    }



}