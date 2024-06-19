self.addEventListener('install', event => {
    console.log('install')
    event.waitUntil(
        caches.open('v1').then(cache => {
            return cache.addAll([
                'index.html',
            ]);
        })
    );
});

self.addEventListener('push', event => {
    console.log('push')
    const data = event.data.json();
    const title = data.title;
    const message = data.message;
    const icon = 'icon.png';

    event.waitUntil(
        self.registration.showNotification(title, {
            body: message,
            icon: icon
        })
    );
});

self.addEventListener('notificationclick', event => {
    console.log('notificationclick')
    event.notification.close();
    event.waitUntil(
        clients.openWindow('https://example.com')
    );
});

self.addEventListener('activate', event => {
    console.log('activate')
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== 'v1') {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Subscribe to ntfy topic
self.addEventListener('activate', async event => {
    console.log('activate ntfy')
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('BMcl3sd5GAHBZX0SrL_9hqaniFb5Atmv1P3VJcN2lHFbIoi7HFlGcGSJIWloA5i6sk10WGJD9FbAPx9eBHfoYEU')
    });

    // Send subscription to your server
    fetch('http://192.168.1.194:8092', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscription.getKey('p256dh'),
                auth: subscription.getKey('auth')
            }
        })
    });
});

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
