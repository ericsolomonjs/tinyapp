function getUserByEmail(email, database)  {
  for (let user in database) {
    if (email === database[user].email) {
      return database[user];
    }
  }
  return undefined;
}

function generateRandomString() {
  return Math.random().toString(36).slice(6);
}

//find urls by user ID
function urlsForUser(id) {
  let fnUsers = {};
  for (let url in urlDatabase) {
    if ( urlDatabase[url].userID === id ) {
      fnUsers[url] = urlDatabase[url];
    }
  }
  return fnUsers                                                                                                                                                                                    ;
}

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
};

  module.exports = { 
    generateRandomString,
    getUserByEmail,
    urlsForUser,
    urlDatabase: urlDatabase,
    users: users
  }