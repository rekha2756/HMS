const { generateKeyPairSync } = require("crypto");
const fs = require("fs");

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

fs.writeFileSync(
  "keys/private_key.pem",
  privateKey.export({
    type: "pkcs1",
    format: "pem",
  })
);

fs.writeFileSync(
  "keys/public_key.pem",
  publicKey.export({
    type: "pkcs1",
    format: "pem",
  })
);

console.log("✅ Keys generated successfully!");