import { $ } from "bun";
import DB from "./db";

const db = await DB("./config.json");

const onRun = async () => {
  let configUpdated = false;

  if (!(await db.has("user"))) {
    await db.set("user", "user.name");
    configUpdated = true;
  }
  if (!(await db.has("pass"))) {
    await db.set("pass", "pass.word");
    configUpdated = true;
  }

  if (!(await db.has("hostv6"))) {
    await db.set("hostv6", "wow.ipv6");
    configUpdated = true;
  }
  if (!(await db.has("hostv4"))) {
    await db.set("hostv4", "wow.ipv4");
    configUpdated = true;
  }
  if (!(await db.has("interval"))) {
    await db.set("interval", 1000);
    configUpdated = true;
  }

  if (configUpdated) {
    throw new Error("Please update your config.");
  } else {
    return setInterval(update, await db.get("interval"));
  }
};

const api = "freedns.afraid.org/nic/update";

const lastIps = {
  v6: "",
  v4: "",
};

const getIps = async () => {
  return {
    v6: await $`dig +short @2606:4700:4700::1111 -6 ch txt whoami.cloudflare`.json(),
    v4: await $`dig +short @1.1.1.1 ch txt 11 whoami.cloudflare`.json(),
  };
};

const update = async () => {
  const ip = await getIps();

  if (ip.v6 !== lastIps.v6) {
    lastIps.v6 = ip.v6;

    await updatev6();
  }

  if (ip.v4 !== lastIps.v4) {
    lastIps.v4 = ip.v4;

    await updatev4();
  }
};

const updatev6 = async () => {
  return await fetch(
    `https://${await db.get("user")}:${await db.get(
      "pass"
    )}@${api}?hostname=${await db.get("hostv6")}&myip=${lastIps.v6}`
  );
};

const updatev4 = async () => {
  return await fetch(
    `https://${await db.get("user")}:${await db.get(
      "pass"
    )}@${api}?hostname=${await db.get("hostv4")}&myip=${lastIps.v4}`
  );
};

onRun();
