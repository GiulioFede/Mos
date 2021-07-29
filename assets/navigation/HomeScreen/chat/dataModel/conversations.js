
class Conversations {
    constructor(chats, users){
        this.chats = chats;
        this.users = users;
    }

    getChats() { return this.chats;}
    getUsers() { return this.users;}
    setChats(chats) { this.chats = chats;}
    setUsers(users) { this.users = users;}
}