const { Client, Location, Poll, List, Buttons, LocalAuth } = require('./index');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

process.stdout.write('\x1Bc'); // Clear console

console.log('Starting WhatsApp vCard sender...\n');

// Create client instance with local auth
// const client = new Client({
//     authStrategy: new LocalAuth(),
//     puppeteer: {
//         headless: true,
//         args: ['--no-sandbox', '--disable-setuid-sandbox']
//     }
// });

// Create client instance with local auth
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            // '--disable-web-security',
            // '--disable-features=IsolateOrigins,site-per-process'
        ]
        // defaultViewport: null
    }
});
// client initialize does not finish at ready now.
client.initialize();

// Loading screen event
client.on('loading_screen', (percent, message) => {
    console.log('LOADING:', percent, '%', message);
});

// QR code event
client.on('qr', (qr) => {
    console.log('Please scan the QR code below:');
    qrcode.generate(qr, { small: true });
    console.log('\nWaiting for QR code scan...');
});

// Authenticated event
client.on('authenticated', () => {
    console.log('\n✓ Successfully authenticated!');
    console.log('Waiting for connection...');
});

// // Ready event
// client.on('ready', () => {
//     console.log('\n✓ WhatsApp client is ready and fully connected!');
//     console.log('\nAttempting to send vCard...\n');
//     sendVCard();
// });

client.on('ready', async () => {
    console.log('READY');
    const debugWWebVersion = await client.getWWebVersion();
    console.log(`WWebVersion = ${debugWWebVersion}`);

    client.pupPage.on('pageerror', function(err) {
        console.log('Page error: ' + err.toString());
    });
    client.pupPage.on('error', function(err) {
        console.log('Page error: ' + err.toString());
    });

    sendVCard();
    
});

// Authentication failure event
client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

// Connection state changes
client.on('change_state', state => {
    console.log('Connection state:', state);
});

// Add message handler
client.on('message', async msg => {
    console.log('Message received:', msg.body);
    // You can add your message handling logic here
    if (msg.body == 'sendvcard') {
        sendVCard();
    }
});

// create send contact list numbers with names
async function sendContactList() {
    const recipientNumber = '967773594066@c.us';
    const contactList = [{number: '967773594066@c.us', name: 'John Doe'}, {number: '967773594067@c.us', name: 'Jane Doe'}];
    await client.sendMessage(recipientNumber, contactList, {contactCardList: contactList});
}   

// Function to send vCard
async function sendVCard() {
    try {
        const recipientNumber = '967773594066@c.us';

        const vCard =
            'BEGIN:VCARD\n' +
            'VERSION:3.0\n' +
            'FN:John Doe\n' +
            'ORG:Microsoft;\n' +
            'TEL;type=CELL;type=VOICE;waid=18006427676:+1 (800) 642 7676\n' +
            'END:VCARD';
        const vCardExtended =
            'BEGIN:VCARD\n' +
            'VERSION:3.0\n' +
            'FN:John Doe\n' +
            'ORG:Microsoft;\n' +
            'item1.TEL:+1 (800) 642 7676\n' +
            'item1.X-ABLabel:USA Customer Service\n' +
            'item2.TEL:+55 11 4706 0900\n' +
            'item2.X-ABLabel:Brazil Customer Service\n' +
            'END:VCARD';
        // const userId = 'XXXXXXXXXX@c.us';
        await client.sendMessage(recipientNumber, vCard,{parseVCards: true});
        await client.sendMessage(recipientNumber, vCardExtended,{parseVCards: true});

        sendContactList();

//         console.log(`Sending vCard to: ${recipientNumber}`);
        
//         const vCard = `BEGIN:VCARD
// VERSION:3.0
// FN:John Doe
// N:Doe;John;;;
// TEL;TYPE=CELL:+1234567890
// TEL;TYPE=WORK:+1987654321
// EMAIL;TYPE=WORK:john.doe@example.com
// EMAIL;TYPE=HOME:johndoe@personal.com
// ORG:Example Company Inc.
// TITLE:Senior Software Developer
// ADR;TYPE=WORK:;;123 Business Street;City;State;12345;Country
// URL:https://www.example.com
// NOTE:Contact created via WhatsApp Web API
// END:VCARD`;

//         console.log('Creating temporary vCard file...');
//         fs.writeFileSync('contact.vcf', vCard);

//         console.log('Reading vCard file...');
//         const contact = fs.readFileSync('contact.vcf', 'utf8');
        
//         console.log('Sending message...');
//         await client.sendMessage(recipientNumber, contact,);
        
//         console.log('Cleaning up temporary file...');
//         fs.unlinkSync('contact.vcf');
        
//         console.log('\n✓ vCard sent successfully!');
    } catch (error) {
        console.error('\n❌ Error sending vCard:', error);
    }
}

// Handle disconnections
client.on('disconnected', (reason) => {
    console.error('\n❌ Client disconnected:', reason);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('\n❌ Unhandled promise rejection:', error);
});

console.log('Initializing WhatsApp client...\n');
client.initialize().catch(err => {
    console.error('Failed to initialize client:', err);
    // process.exit(1);
});