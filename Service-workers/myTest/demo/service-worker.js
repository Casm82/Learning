try {
    (function () {
        var APPLICATION_CODE = "1D79D-5C882"; // Your Application Code from Pushwoosh
        var pushDefaultImage = 'https://music.yandex.ru/blocks/common/logo.png';
        var pushDefaultTitle = 'Загловок';
        var pushDefaultUrl = '/';
        var pushwooshUrl = "https://cp.pushwoosh.com/json/1.3/";
        var HIDE_NOTIFICATION_AFTER = false; // in seconds, or false then notification will be hide automatically after 30 seconds
        var DEBUG_MODE = false;
        var hwid = "hwid";
        var url = null;
        var deviceType = navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ? 12 : 11;

        self.addEventListener('push', function (event) {
            try {

                setUpHwid();
                // Since there is no payload data with the first version
                // of push messages, we'll grab some data from
                // an API and use it to populate a notification
                //console.info("Recv'd a push message: ", JSON.stringify(event));
                if (event.data) {
                    var content = event.data.text();
                    content = JSON.parse(content);
                    var title = content['header'] || pushDefaultTitle;
                    var message = content['body'];
                    var icon = content['i'] || pushDefaultImage;
                    var messageHash = content['p'];
                    url = content['l'];

                    return self.registration.showNotification(title, {
                        body: message,
                        icon: icon,
                        tag: messageHash
                    }).then(function () {
                        if (HIDE_NOTIFICATION_AFTER) {
                            setTimeout(closeNotifications, HIDE_NOTIFICATION_AFTER * 1000);
                        }
                    });
                } else {
                    event.waitUntil(
                        fetch(pushwooshUrl + 'getLastMessage', {
                            method: 'post',
                            headers: {
                                "Content-Type": "text/plain;charset=UTF-8"
                            },
                            body: JSON.stringify({
                                "request": {
                                    "application": APPLICATION_CODE,
                                    "hwid": hwid,
                                    "device_type": deviceType
                                }
                            })
                        }).then(function (response) {
                            if (response.status !== 200) {
                                // Either show a message to the user explaining the error
                                // or enter a generic message and handle the
                                // onnotificationclick event to direct the user to a web page
                                //console.log('Looks like there was a problem. Status Code: ' + response.status);
                                throw new Error();
                            }

                            // Examine the text in the response
                            return response.json().then(function (data) {
                                if (!data.response.notification) {
                                    //console.error('The API returned an error.', data.error);
                                    throw new Error();
                                }
                                var notification = data.response.notification;
                                //console.log(notification);

                                var title = notification.chromeTitle || pushDefaultTitle;
                                var message = notification.content;
                                var icon = notification.chromeIcon || pushDefaultImage;
                                var messageHash = notification.messageHash;
                                url = notification.url;

                                return self.registration.showNotification(title, {
                                    body: message,
                                    icon: icon,
                                    tag: messageHash
                                }).then(function () {
                                    if (HIDE_NOTIFICATION_AFTER) {
                                        setTimeout(closeNotifications, HIDE_NOTIFICATION_AFTER * 1000);
                                    }
                                });
                            });
                        }).catch(function (err) {
                            //console.error('Unable to retrieve data', err);

                            if (DEBUG_MODE) {
                                var title = 'An error occurred';
                                var message = 'We were unable to get the information for this push message';
                                var notificationTag = 'notification-error';
                                return self.registration.showNotification(title, {
                                    body: message,
                                    tag: notificationTag
                                });
                            }
                        })
                    );
                }

            } catch (e) {/**/
            }
        });


        self.addEventListener('notificationclick', function (event) {
            try {

                setUpHwid();
                var messageHash = event.notification.tag;
                //console.log(event);
                //console.log("Push open hwid = " + hwid + " messageHash = " + messageHash);
                event.waitUntil(
                    fetch(pushwooshUrl + 'pushStat', {
                        method: 'post',
                        headers: {
                            "Content-Type": "text/plain;charset=UTF-8"
                        },
                        body: '{"request": {"application": "' + APPLICATION_CODE + '","hwid": "' + hwid + '", "hash": "' + messageHash + '"}}'
                    }).then(function (response) {
                            //console.log(response);
                        }
                    ));

                // Android doesn't close the notification when you click on it
                // See: http://crbug.com/463146
                event.notification.close();

                if (url) {
                    var openUrl = url;
                    url = null;
                    return clients.openWindow(openUrl);
                }
                else {
                    return clients.openWindow(pushDefaultUrl);
                }

            } catch (e) {/**/
            }
        });

        // refresh caches
        self.addEventListener('activate', function (event) {
            try {
                event.waitUntil(
                    caches.keys().then(function (cacheNames) {
                        return Promise.all(
                            cacheNames.map(function (cacheName) {
                                return caches.delete(cacheName);
                            })
                        );
                    })
                );
            } catch (e) {/**/
            }
        });

        function closeNotifications() {
            self.registration.getNotifications().then(function (notifications) {
                for (var i = 0; i < notifications.length; ++i) {
                    notifications[i].close();
                }
            });
        }

        // For more information see Pushwoosh API guide http://docs.pushwoosh.com/docs/createmessage
        function createUUID(pushToken) {
            var s = [];
            var hexDigits = "0123456789abcdef";
            for (var i = 0; i < 32; i++) {
                s[i] = hexDigits.substr(pushToken.charCodeAt(i) % hexDigits.length, 1);
            }
            return s.join("");
        }

        function generateHwid(pushToken) {
            var hwid = APPLICATION_CODE + '_' + createUUID(pushToken);
            return hwid;
        }

        function getPushToken(pushSubscription) {
            var pushToken = '';
            if (pushSubscription.subscriptionId) {
                pushToken = pushSubscription.subscriptionId;
            }
            else {
                pushToken = pushSubscription.endpoint.split('/').pop();
            }
            return pushToken;
        }

        function setUpHwid() {
            //self.registration.pushManager.getSubscription().then(function (subscription) {
            self.registration.pushManager.subscribe({userVisibleOnly: true}).then(function (subscription) {
                if (subscription) {
                    hwid = generateHwid(getPushToken(subscription));
                }
            });
        }

    })();
} catch (e) {
}
