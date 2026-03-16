const { generateKeyPairSync } = require("crypto");
const { execSync } = require("child_process");

const deployment = "anonymous-restaurant_management_system";

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

const jwtPrivateKey = privateKey
  .export({ type: "pkcs8", format: "pem" })
  .toString()
  .trimEnd()
  .replace(/\n/g, " ");

const jwks = JSON.stringify({ keys: [publicKey.export({ format: "jwk" })] });

execSync(
  `npx convex env set --deployment-name ${deployment} -- SITE_URL "http://localhost:5173"`,
  { stdio: "inherit" },
);

execSync(
  `npx convex env set --deployment-name ${deployment} -- JWT_PRIVATE_KEY "${jwtPrivateKey.replace(/"/g, '\\\"')}"`,
  { stdio: "ignore" },
);

execSync(
  `npx convex env set --deployment-name ${deployment} -- JWKS "${jwks.replace(/"/g, '\\\"')}"`,
  { stdio: "ignore" },
);

console.log("Auth env vars set.");
