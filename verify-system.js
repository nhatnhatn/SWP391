// Quick system verification script
const axios = require('axios');

async function verifySystem() {
    console.log('🔍 Vietnamese Pet Management System - Verification');
    console.log('==================================================\n');

    try {
        // Test backend health
        console.log('1. Testing Backend Health...');
        const healthResponse = await axios.get('http://localhost:8080/api/auth/health', { timeout: 5000 });
        console.log('✅ Backend Status:', healthResponse.data.message);

        // Test authentication
        console.log('\n2. Testing Authentication...');
        const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
            email: 'admin@mylittlepet.com',
            password: 'admin123'
        }, { timeout: 5000 });
        console.log('✅ Authentication: Login successful');

        // Test frontend access
        console.log('\n3. Testing Frontend Access...');
        const frontendResponse = await axios.get('http://localhost:5175', { timeout: 5000 });
        console.log('✅ Frontend: Application accessible');

        console.log('\n🎉 System Verification Complete!');
        console.log('================================');
        console.log('✅ Backend Server: http://localhost:8080');
        console.log('✅ Frontend App: http://localhost:5175');
        console.log('✅ Login Credentials: admin@mylittlepet.com / admin123');
        console.log('\n🚀 Your Vietnamese Pet Management System is ready to use!');

    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('💡 Make sure both servers are running:');
            console.error('   Backend: npm run start:backend');
            console.error('   Frontend: npm run start:frontend');
        }
    }
}

verifySystem();
