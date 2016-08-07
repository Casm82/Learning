'use strict';

self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('push', function(event) {
  // Since there is no payload data with the first version
  // of push messages, we'll grab some data from
  // an API and use it to populate a notification
  event.waitUntil(
    fetch('/push/v1/get', {credentials: 'include'}).then(function(response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' + response.status);
        throw new Error();
      }

      return response.json().then(function(data) {
        if (data.error || !data.messages) {
          console.error('The API returned an error.', data.error);
          throw new Error();
        }
        var message = new Promise(function (resolve, reject) {
        });
        data.messages.forEach(function(msg){
          var title = msg.title.replace(/\\n/gm, "\n");
          var body = msg.body.replace(/\\n/gm, "\n");
          var icon = msg.icon;
          var url = msg.url;

          message = self.registration.showNotification(title, {
            body: body,
            icon: icon,
            data: {
              url: url
            }
          });
        });
        return message;
      }).catch(function(err) {
        console.error('Unable to retrieve data', err);
      });
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = event.notification.data.url;
  event.waitUntil(clients.openWindow(url));
});
