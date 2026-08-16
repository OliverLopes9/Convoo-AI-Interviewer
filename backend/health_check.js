const fetch = require('node-fetch');

const API_URL = 'http://localhost:5001/api';

async function run() {
    try {
        console.log('Checking backend health...');
        // Try to signup a temp user to verify DB and API are working
        const email = `healthcheck_${Date.now()}@test.com`;
        const res = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'password', name: 'Health Check' })
        });

        if (res.ok) {
            console.log('Backend is UP and serving requests.');
        } else {
            console.log('Backend returned error:', res.status, await res.text());
        }
    } catch (e) {
        console.error('Backend is DOWN or unreachable:', e.message);
    }
}

run();
