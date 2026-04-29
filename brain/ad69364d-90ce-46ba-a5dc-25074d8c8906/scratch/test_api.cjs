const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:5000/api/shop/daily');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.error('Error fetching:', e.response?.data || e.message);
  }
}

test();
