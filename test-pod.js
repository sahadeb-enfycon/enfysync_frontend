async function run() {
  const loginRes = await fetch('https://api.enfycon.com/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ash@enfycon.com', password: '12345678' })
  });
  const loginData = await loginRes.json();
  const token = loginData.access_token;
  
  const podRes = await fetch('https://api.enfycon.com/pods/11aaae7d-26c7-4b61-a0db-334568f05923', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Status:', podRes.status);
  console.log('Response:', await podRes.text());
}
run();
