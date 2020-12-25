importScripts('https://unpkg.com/dexie@3.0.3/dist/dexie.js');

let db = new Dexie('contact-form');
db.version(1).stores({
  contacts: '++id,name,email',
});

self.addEventListener('sync', (event) => {
  console.log(`Sync event received: ${event.tag}`);

  if (event.tag == 'contact-sync') {
    event.waitUntil(
      db.contacts.toArray().then((contacts) => {
        contacts.map((contact) => {
          fetch('api.html', {
            method: 'post',
            body: JSON.stringify({
              name: contact.name,
              email: contact.email,
            }),
          })
            .then((res) => {
              if (!res.ok) {
                throw Error(res.statusText);
              }
              return res;
            })
            .then(() => {
              console.log(`Sent data: ${contact.name}, ${contact.email}`);

              // On successful fetch we delete the data item
              db.contacts.where('id').equals(contact.id).delete();
            })
            .catch((error) => {
              console.error(`Error: ${error}`);
            });
        });
      })
    );
  }
});
