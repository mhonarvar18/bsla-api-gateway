const port = process.env.PORT;
const ip = process.env.IP;
let url = process.env.URL ? process.env.URL : `${ip}:${port}`;
url = process.env.PROTOCOL + '://' + url + '/';

export const server = {
  port,
  url,
  ip,
};
