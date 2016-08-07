var port;

self.addEventListener('push', function(event) {
  var obj = event.data ? event.data.json() : {
     "action": "",
     "name":   "",
     "msg":    ""
  };
  console.log("service worker recieve push message: " + JSON.stringify(obj));

  if(obj.action === 'subscribe' || obj.action === 'unsubscribe') {
    fireNotification(obj, event);
    port.postMessage(obj);
  } else if(obj.action === 'init' || obj.action === 'chatMsg') {
    port.postMessage(obj);
  }
});

self.onmessage = function(e) {
  console.log("service worker recieve channel message: " + e.data);
  port = e.ports[0];
}

function fireNotification(obj, event) {
  var title = 'Subscription change';
  var body = obj.name + ' has ' + obj.action + 'd.';
  var icon = 'push-icon.png';
  var tag = 'push';

  event.waitUntil(self.registration.showNotification(title, {
    body: body,
    icon: icon,
    tag: tag,
    vibrate: [1000, 500, 2000]
  }));
}
