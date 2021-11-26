const crypto = require("crypto");
const sha256 = (text) => crypto.createHash("sha256").update(text).digest("hex");
const randomString = (size) =>
  crypto.randomBytes(size).toString("hex").slice(0, size);

// returns [hashedPassword , saltKey]
function salting(saltingRounds, password) {
  let str = sha256(password);
  let saltKey = randomString(8);
  for (let i = 0; i < saltingRounds - 1; i++) str = sha256(saltKey + str);
  return [str, saltKey];
}

// returns hashedPassword
function reverseSalting(saltingRounds, password, saltKey) {
  let str = sha256(password);
  for (let i = 0; i < saltingRounds - 1; i++) str = sha256(saltKey + str);
  return str;
}

module.exports = {
  salting,
  reverseSalting,
};
