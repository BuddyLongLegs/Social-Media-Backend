const USERNAME_PATTERN = /^[a-z0-9_](?!.*?\.{2})[a-z0-9_.]{1,28}[a-z0-9_]$/;
const EMAIL_PATTERN = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

module.exports.USERNAME_PATTERN = USERNAME_PATTERN;
module.exports.EMAIL_PATTERN = EMAIL_PATTERN;