const fs = require('fs');
const path = require('path');

(async () => {
    try {
        const publicIp = await import('public-ip');
        const ipAddress = await publicIp.v4();

        console.log(`Fetched IP Address: ${ipAddress}`);

        const envFilePath = path.resolve(process.cwd(), '.env');

        // Read existing content
        let envContent = fs.existsSync(envFilePath) ? fs.readFileSync(envFilePath, 'utf8') : '';

        // Replace or add the IP_ADDRESS key
        const updatedEnvContent = envContent.includes('IP_ADDRESS=')
            ? envContent.replace(/IP_ADDRESS=.*/, `IP_ADDRESS=${ipAddress}`)
            : envContent + `\nIP_ADDRESS=${ipAddress}`;

        // Write to .env file
        fs.writeFileSync(envFilePath, updatedEnvContent.trim() + '\n');

        console.log(`.env file updated successfully with IP_ADDRESS=${ipAddress}`);
    } catch (error) {
        console.error('Error fetching or updating the IP address:', error);
    }
})();
