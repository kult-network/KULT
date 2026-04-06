const axios = require('axios');
const HEADERS = { 'xc-token': 'nc_pat_HfJFB0a_IMPxQFlrzeJ-79BEPpK1jgWvuPlRgjDL' };
const NOCO_BASE_URL = "https://app.nocodb.com/api/v1/db/data/noco/pdo67xcuojyjxq5";
const TABLE_ID_PROGRAMS = "m8dmxdncr8cvqwh";

async function test() {
    let payloadData = {
        "Title": "Test",
        "Description": "test",
        "Category": "Workshops",
        "Speaker": "None",
        "start_time": "2024-05-10T10:00:00.000Z",
        "end_time": "2024-05-10T12:00:00.000Z",
        "Price": 0,
        "Hubs": 5
    };
    try {
        const res = await axios.post(`${NOCO_BASE_URL}/${TABLE_ID_PROGRAMS}`, payloadData, { headers: HEADERS });
        console.log(res.data);
    } catch (err) {
        console.error(err.response?.data);
    }
}
test();
