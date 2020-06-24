<template>
    <div id='chat-app-cont' style='padding:30px'>
        <div id='noteChat'>Chat is currently only available on laptops/desktops. If you do not have access to one, feel free to email your teacher.<br>If you are on your laptop/desktop, increase the size of your browser window.</div>
    <div id="chat-app">
        <div id='noteChat'>Chat is optimized for viewing on laptops/desktops</div>
        <b-tooltip
            target="message-info-tooltip"
            triggers="hover"
        >Teachers' emails are of the format &lt;first-name&gt;@aawaaz.co</b-tooltip>
        <div class="login-popup">
            <div class="form-popup" id="popupForm">
                <div class="form-container">
                    <h2>Compose message</h2>
                    <label for="recipient">
                        <strong>
                            Recipient email
                            <b-icon-info-circle shift-h="2" shift-v="0.5" id="message-info-tooltip"></b-icon-info-circle>
                        </strong>
                    </label>
                    <input type="text" id="recipient" name="recipient" required />
                    <label for="message">
                        <strong>Message</strong>
                    </label>
                    <input type="text" id="message" name="message" required />
                    <button type="button" id="send-btn" class="btn">Send</button>
                    <button type="button" id="btn-cancel" class="btn">Close</button>
                </div>
            </div>
        </div>
        <div id="chat-interface" style='display:flex'>
            <div id="chatwbtn">
                <b-button id="compose" variant="light" size="sm">
                    <b-icon-chat-dots-fill font-scale="0.9" shift-v="5" variant="secondary"></b-icon-chat-dots-fill>
                </b-button>
                <div id="chats"></div>
            </div>
            <div id="messages">
                <div id="message-header">
                    <img id="header-pic" />
                    <div id="header-name"></div>
                </div>
                <div id="message-list"></div>
                <div id="message-input">
                    <textarea type="text" id="imessage" name="message" required></textarea>
                    <button type="button" id="send">Send</button>
                </div>
            </div>
        </div>
    </div>
    </div>
</template>

<script>
const fb = require("../firebaseConfig.js");
import moment from "moment";
import "../assets/scss/chat.scss";
const $ = require('jquery')

export default {
    mounted() {
        function unsubscribe(){}
        function unsubscribeChat(){}
        //Hover over time to see full details
        //read receipts is working but font-weight property is not working maybe due to the other sass files

        function openForm() {
            //Opens compose form
            document.getElementById("popupForm").style.display = "block";
            document.querySelector(".login-popup").style.display = "block";
        }

        function closeForm() {
            //Closes compose form
            document.getElementById("popupForm").style.display = "none";
            document.querySelector(".login-popup").style.display = "none";
        }

        function updateChat(querySnapshot, sender, msg) {
            querySnapshot.forEach(function(doc) {
                fb.db
                    .collection("chats")
                    .doc(doc.id)
                    .collection("messages")
                    .add({
                        sender: sender.email,
                        timestamp: Date.now(),
                        message: msg
                    });
                fb.db
                    .collection("chats")
                    .doc(doc.id)
                    .update({
                        lastMessage: msg,
                        lastSender: sender.email,
                        chatUpdated: Date.now(),
                        recipientRead: false
                    });
            });
        }

        function composeMessage() {
            var recipient = recipientElement.value;
            if (msgElement.value) {
                fb.auth.currentUser.getIdTokenResult().then(idTokenResult => {
                    if (idTokenResult.claims.teacher) {
                        var teacher = true;
                    } else {
                        var teacher = false;
                    }
                    if (teacher) {
                        var query = fb.db
                            .collection("users")
                            .where("email", "==", recipient);
                    } else {
                        var query = fb.db
                            .collection("users")
                            .where("email", "==", recipient)
                            .where("type", "==", "teacher");
                    }
                    var sender = fb.auth.currentUser;
                    query.get().then(function(querySnapshot) {
                        if (querySnapshot.empty) {
                            alert("User not found (Note: Students can only chat with teachers)");
                            recipientElement.value = "";
                        } else if (recipient == sender.email) {
                            alert("Can't send messages to yourself, sorry");
                            recipientElement.value = "";
                        } else {
                            var msg = msgElement.value;
                            var query = fb.db
                                .collection("chats")
                                .where("members", "in", [
                                    [recipient, sender.email],
                                    [sender.email, recipient]
                                ]);
                            query.get().then(function(querySnapshot) {
                                if (querySnapshot.empty) {
                                    var userData = {};
                                    var userQuery = fb.db
                                        .collection("users")
                                        .where("email", "in", [
                                            recipient,
                                            sender.email
                                        ]);

                                    userQuery
                                        .get()
                                        .then(function(userQuerySnapshot) {
                                            userQuerySnapshot.forEach(function(
                                                doc
                                            ) {
                                                userData[doc.data().email] = {
                                                    profilePicUrl: doc.data()
                                                        .profilePicUrl,
                                                    name: doc.data().name
                                                };
                                            });
                                        })
                                        .then(function() {
                                            fb.db
                                                .collection("chats")
                                                .add({
                                                    members: [
                                                        sender.email,
                                                        recipient
                                                    ],
                                                    userData: userData
                                                })
                                                .then(function() {
                                                    var query2 = fb.db
                                                        .collection("chats")
                                                        .where(
                                                            "members",
                                                            "in",
                                                            [
                                                                [
                                                                    recipient,
                                                                    sender.email
                                                                ],
                                                                [
                                                                    sender.email,
                                                                    recipient
                                                                ]
                                                            ]
                                                        );
                                                    query2
                                                        .get()
                                                        .then(function(
                                                            querySnapshot
                                                        ) {
                                                            updateChat(
                                                                querySnapshot,
                                                                sender,
                                                                msg
                                                            );
                                                        });
                                                });
                                        });
                                } else {
                                    updateChat(querySnapshot, sender, msg);
                                }
                            });
                            msgElement.value = "";
                            recipientElement.value = "";
                            composeForm.style.display = "none";
                        }
                    });
                });
            } else {
                alert("Empty message field!");
            }
        }

        function loadChats(n = 12) {
            var user = fb.auth.currentUser.email;
            var query = fb.db
                .collection("chats")
                .where("members", "array-contains", user)
                .orderBy("chatUpdated", "desc")
                .limit(n);

            chatScrollCount = 0;
            unsubscribe = query.onSnapshot(function(snapshot) {
                snapshot.docChanges().forEach(function(change) {
                    if (change.type === "added") {
                        chatScrollCount += 1;
                    }
                    var chat = change.doc.data();
                    var members = chat.members;
                    var recipient = "";
                    members.forEach(function(value) {
                        if (value != user) {
                            recipient = value;
                        }
                    });
                    displayChat(
                        change.doc.id,
                        chat.chatUpdated,
                        chat.userData[recipient].name,
                        chat.lastMessage,
                        chat.userData[recipient].profilePicUrl,
                        chat.lastSender,
                        chat.recipientRead
                    );
                });
            });
        }

        var CHAT_TEMPLATE =
            '<div class="chat-container"><img class="pic"><div class="chat-content"><div class="name"></div>' +
            '<div class="message"></div></div>' +
            "</div>";

        function createAndInsertChat(id, timestamp) {
            const container = document.createElement("div");
            container.innerHTML = CHAT_TEMPLATE;
            const div = container.firstChild;
            div.setAttribute("id", id);
            div.setAttribute("timestamp", timestamp);

            // figure out where to insert new message
            const existingChats = chatListElement.children;
            if (existingChats.length === 0) {
                chatListElement.appendChild(div);
            } else {
                let chatListNode = existingChats[0];
                while (chatListNode) {
                    const chatListNodeTime = chatListNode.getAttribute(
                        "timestamp"
                    );
                    if (!chatListNodeTime) {
                        throw new Error(
                            `Child ${chatListNode.id} has no 'timestamp' attribute`
                        );
                    }

                    if (chatListNodeTime < timestamp) {
                        break;
                    }

                    chatListNode = chatListNode.nextSibling;
                }

                chatListElement.insertBefore(div, chatListNode);
            }
            return div;
        }

        function displayChat(
            id,
            timestamp,
            name,
            lastMessage,
            picUrl,
            lastSender,
            read
        ) {
            if (document.getElementById(id)) {
                document.getElementById(id).remove();
            }
            var div = createAndInsertChat(id, timestamp);
            const content = div.querySelector(".chat-content");
            if (!read && lastSender != fb.auth.currentUser.email) {
                content.classList.add("unread");
            }
            div.querySelector(".pic").src = picUrl;
            div.querySelector(".name").textContent = name;
            if (lastMessage.length > 18) {
                lastMessage = lastMessage.slice(0, 18) + "..";
            }
            if (fb.auth.currentUser.email == lastSender) {
                div.querySelector(".message").textContent =
                    "You: " + lastMessage;
            } else {
                div.querySelector(".message").textContent = lastMessage;
            }
            div.addEventListener("click", loadMessages);
        }

        function chatScrollCheck() {
            var a = chatListElement;
            //Noted to not work on all browsers (works on Chrome)
            if (
                a.scrollHeight - a.scrollTop - a.clientHeight == 0 &&
                chatScrollCount < chatCount
            ) {
                chatScrollCount += 12;
                unsubscribe();
                loadChats(chatScrollCount);
            }
        }

        function getNumberOfChatsAndUserInfo() {
            var user = fb.auth.currentUser.email;
            var query = fb.db
                .collection("chats")
                .where("members", "array-contains", user);
            query.get().then(function(snapshot) {
                snapshot.forEach(function(doc) {
                    chatCount = chatCount + 1;
                });
            });
            var userQuery = fb.db
                .collection("users")
                .where("email", "==", user);
            userQuery
                .get()
                .then(function(snapshot) {
                    snapshot.forEach(function(doc) {
                        userPicUrl = doc.data().profilePicUrl;
                    });
                })
                .then(() => {
                    loadChats();
                });
        }

        function readReceipt() {
            const docRef = fb.db.collection("chats").doc(chatId);
            docRef.get().then(doc => {
                if (doc.data().lastSender != fb.auth.currentUser.email) {
                    docRef.update({
                        recipientRead: true
                    });
                }
            });
        }

        function loadMessages() {
            messageListElement.innerHTML = "";
            messageScrollCount = 0;
            recipientPicUrl = this.querySelector(".pic").src;
            if (chatId && this.id != chatId) {
                unsubscribeChat();
            }
            chatId = this.id;
            messageCount = 0;
            batchQuant = 30;
            getMessageCount();
            document.getElementById("header-pic").src = recipientPicUrl;
            document.getElementById(
                "header-name"
            ).innerHTML = this.querySelector(".name").textContent;
            var query = fb.db
                .collection("chats")
                .doc(chatId)
                .collection("messages")
                .orderBy("timestamp", "desc")
                .limit(30);
            unsubscribeChat = query.onSnapshot(function(snapshot) {
                snapshot.docChanges().forEach(function(change) {
                    if (change.type == "added") {
                        subsequentMessageLoad = false;
                        messageScrollCount += 1;
                        var message = change.doc.data();
                        readReceipt();
                        displayMessage(
                            change.doc.id,
                            message.timestamp,
                            message.sender,
                            message.message,
                            recipientPicUrl
                        );
                    }
                });
            });
        }

        function displayMessage(
            id,
            timestamp,
            sender,
            message,
            recipientPicUrl
        ) {
            var div =
                document.getElementById(id) ||
                createAndInsertMessage(id, timestamp);
            var messageElement = div.querySelector(".message");
            var messageData = div.querySelector(".message-data");
            var time = div.querySelector(".time");
            var timedet = div.querySelector(".time-det");
            var pic = div.querySelector(".pic");

            messageElement.textContent = message;
            // Replace all line breaks by <br>.
            messageElement.innerHTML = messageElement.innerHTML.replace(
                /\n/g,
                "<br>"
            );
            if (sender == fb.auth.currentUser.email) {
                messageElement.classList.add("my-message");
                messageElement.classList.add("float-right");
                messageData.classList.add("float-right");
                pic.src = userPicUrl;
            } else {
                messageElement.classList.add("other-message");
                pic.src = recipientPicUrl;
            }
            const timeval = new Date(timestamp);
            timedet.setAttribute(
                "title",
                timeval.toString().slice(0, 16) +
                    "(" +
                    moment(timeval).fromNow() +
                    ")"
            );
            time.innerHTML = timeval.toString().slice(16, 21);
            if (!subsequentMessageLoad) {
                messageListElement.scrollTop = messageListElement.scrollHeight;
            } else {
                messageListElement.scrollTop =
                    messageListElement.scrollHeight - messageListHeight;
            }
            document.getElementById("messages").style.display = "flex";
        }

        var MESSAGE_TEMPLATE =
            '<div class="message-container"><div class="message-data"><span class="time-det"><div class="time"></div></span><img class="pic"></div>' +
            '<div class="message"></div>' +
            "</div>";

        function createAndInsertMessage(id, timestamp) {
            const container = document.createElement("div");
            container.innerHTML = MESSAGE_TEMPLATE;
            const div = container.firstChild;
            div.setAttribute("id", id);

            div.setAttribute("timestamp", timestamp);

            const existingMessages = messageListElement.children;
            if (existingMessages.length === 0) {
                messageListElement.appendChild(div);
            } else {
                let messageListNode = existingMessages[0];

                while (messageListNode) {
                    const messageListNodeTime = messageListNode.getAttribute(
                        "timestamp"
                    );

                    if (!messageListNodeTime) {
                        throw new Error(
                            `Child ${messageListNode.id} has no 'timestamp' attribute`
                        );
                    }

                    if (messageListNodeTime < timestamp) {
                        break;
                    }

                    messageListNode = messageListNode.nextSibling;
                }

                messageListElement.insertBefore(div, messageListNode);
            }

            return div;
        }

        //I cannot for the life of me figure out how to get messages in batches without rereading data. For some reason the endBefore method for query doesn't work
        function loadNextMessages(n) {
            subsequentMessageLoad = true;
            var query = fb.db
                .collection("chats")
                .doc(chatId)
                .collection("messages")
                .orderBy("timestamp", "desc")
                .limit(n);
            messageScrollCount = 0;
            query.get().then(function(snapshot) {
                snapshot.forEach(function(doc) {
                    messageScrollCount += 1;
                    var message = doc.data();
                    displayMessage(
                        doc.id,
                        message.timestamp,
                        message.sender,
                        message.message,
                        recipientPicUrl
                    );
                });
            });
        }

        function messageScrollCheck() {
            var a = messageListElement;
            messageListHeight = a.scrollHeight;
            if (a.scrollTop == 0 && messageScrollCount < messageCount) {
                batchQuant += 30;
                loadNextMessages(batchQuant);
            }
        }

        function getMessageCount() {
            var query = fb.db
                .collection("chats")
                .doc(chatId)
                .collection("messages");
            query.get().then(function(snapshot) {
                snapshot.forEach(function() {
                    messageCount += 1;
                });
            });
        }

        function sendMessage() {
            if (imessage.value) {
                fb.db
                    .collection("chats")
                    .doc(chatId)
                    .collection("messages")
                    .add({
                        sender: fb.auth.currentUser.email,
                        timestamp: Date.now(),
                        message: imessage.value
                    });
                fb.db
                    .collection("chats")
                    .doc(chatId)
                    .update({
                        lastMessage: imessage.value,
                        lastSender: fb.auth.currentUser.email,
                        chatUpdated: Date.now(),
                        recipientRead: false
                    });
                imessage.value = "";
            } else {
                alert("Empty message field!");
            }
        }

        var composeButton = document.getElementById("compose");
        var cancelButton = document.getElementById("btn-cancel");
        var app = document.getElementById("app");
        var sendButton = document.getElementById("send-btn");
        var chatListElement = document.getElementById("chats");
        var recipientElement = document.getElementById("recipient");
        var msgElement = document.getElementById("message");
        var composeForm = document.getElementById("popupForm");
        var messageListElement = document.getElementById("message-list");
        var imessage = document.getElementById("imessage"); //Message input inside chatbox
        var send = document.getElementById("send");

        var chatScrollCount = 0; //For number of chats loaded
        var chatCount = 0;
        var userPicUrl = "";
        var chatId = ""; //Document ID of currently loaded chat
        var recipientPicUrl = "";
        var messageCount = 0;
        var messageScrollCount = 0; //Number of Messages loaded
        var subsequentMessageLoad = false;
        var messageListHeight = 0; //To ensure scroll does not get disrupted
        var batchQuant = 30; //Number of messages loaded (other values have to be changed if being changed)

        composeButton.addEventListener("click", openForm);
        cancelButton.addEventListener("click", closeForm);
        sendButton.addEventListener("click", composeMessage);
        chatListElement.addEventListener("scroll", chatScrollCheck);
        messageListElement.addEventListener("scroll", messageScrollCheck);
        send.addEventListener("click", sendMessage);
        $("#imessage").keypress(function(event) { 
            if (event.keyCode === 13 && !event.shiftKey) {
                event.preventDefault(); 
                $("#send").click(); 
            } 
        }); 

        getNumberOfChatsAndUserInfo();
        
    }
};
</script>
