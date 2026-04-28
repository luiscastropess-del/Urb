import fetch from 'node-fetch';
async function test() {
  const url = 'https://local-urbano.onrender.com/api/public/packages';
  const res = await fetch(url);
  console.log(res.status, await res.text());
}
test();
