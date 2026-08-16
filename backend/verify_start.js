const fetch = require('node-fetch');

const API_URL = 'http://localhost:5001/api';

async function run() {
    try {
        // 1. Signup
        const email = `start_test_${Date.now()}@test.com`;
        const signupRes = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'password', name: 'Start Tester' })
        });
        const signupData = await signupRes.json();
        const token = signupData.token;

        if (!token) throw new Error('Signup failed, no token');

        // 2. Start Interview
        console.log('Attempting to start interview...');
        const startRes = await fetch(`${API_URL}/interview/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ difficulty: 'beginner' })
        });

        if (startRes.ok) {
            const data = await startRes.json();
            console.log('Interview started successfully:', data.interviewId);
            console.log('First Question:', data.question);
        } else {
            console.log('Failed to start interview:', startRes.status, await startRes.text());
        }

    } catch (e) {
        console.error('Error verifying start interview:', e);
    }
}

run();
