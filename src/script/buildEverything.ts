import { config } from "dotenv";

import { main } from "../main";

config({
  debug: true
});

main().then(() => {});
