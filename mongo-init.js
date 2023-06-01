db.createUser({
    user: 'root',
    pwd: 'hunter2',
    roles: [{ role: 'readWrite', db: 'tarpaulin' }]
  });