function getUserByEmail(email, database)  {
  let fnUserObj = {} ;
  for (let user in database) {
    if (email === database[user].email) {
      return database[user];
    }
  }
  return fnUserObj;
}

module.exports = { getUserByEmail }