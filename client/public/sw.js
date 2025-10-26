// サービスワーカーが「push」イベントを受け取ったときの処理
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/logo.png',
      badge: '/logo.png',
      vibrate: [100, 50, 100],
      data: data.data // Include the data field from the payload
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// 表示された通知がクリックされたときの処理
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const notificationData = event.notification.data;
  let url = self.location.origin;

  if (notificationData && notificationData.id) {
    url += '/error-notifications';
    const params = new URLSearchParams();
    params.set('id', notificationData.id);
    url += '?' + params.toString();
  }

  event.waitUntil(
    clients.openWindow(url)
  );
});
