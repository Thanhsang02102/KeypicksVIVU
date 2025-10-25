const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Airport = require('../models/Airport');
const Airline = require('../models/Airline');
const Flight = require('../models/Flight');

// Helper function to convert Asia/Ho_Chi_Minh time to UTC
// Vietnam is UTC+7, so we subtract 7 hours to get UTC
const vietnamToUTC = (dateString) => {
    const vietnamDate = new Date(dateString);
    // Subtract 7 hours to convert from Vietnam time to UTC
    const utcDate = new Date(vietnamDate.getTime() - (7 * 60 * 60 * 1000));
    return utcDate;
};

// Helper function to create flight date in Vietnam timezone
// Input: date string like '2025-01-15', time string like '06:00'
// Output: UTC Date object
const createFlightDate = (dateStr, timeStr) => {
    // Parse Vietnam local time
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);
    
    // Create date string in Vietnam timezone (UTC+7)
    // We need to manually calculate UTC by subtracting 7 hours
    const vietnamDateTime = new Date(year, month - 1, day, hour, minute, 0);
    const utcDateTime = new Date(vietnamDateTime.getTime() - (7 * 60 * 60 * 1000));
    
    return utcDateTime;
};

// Connect to MongoDB
const connectDB = async () => {
    try {
        // Use MONGODB_URI from environment, fallback to docker service name
        const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:admin123@mongodb:27017/keypicksvivu?authSource=admin';
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected successfully');
        console.log('Server timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
        console.log('Current UTC time:', new Date().toISOString());
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Load JSON data
const loadJSONFile = (filename) => {
    const filePath = path.join(__dirname, 'data', filename);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
};

// Seed airports
const seedAirports = async () => {
    try {
        const data = loadJSONFile('airports.json');
        await Airport.deleteMany({});
        await Airport.insertMany(data.airports);
        console.log('✓ Airports seeded successfully');
    } catch (error) {
        console.error('Error seeding airports:', error);
    }
};

// Seed airlines
const seedAirlines = async () => {
    try {
        const data = loadJSONFile('airlines.json');
        await Airline.deleteMany({});
        await Airline.insertMany(data.airlines);
        console.log('✓ Airlines seeded successfully');
    } catch (error) {
        console.error('Error seeding airlines:', error);
    }
};

// Seed flights with sample data
// All times are in Asia/Ho_Chi_Minh timezone and will be converted to UTC for storage
const seedFlights = async () => {
    try {
        await Flight.deleteMany({});
        
        console.log('\n📅 Creating flight data with Vietnam timezone (Asia/Ho_Chi_Minh)...');
        console.log('   All times shown are Vietnam local time (UTC+7)');
        console.log('   Database will store in UTC\n');
        
        const sampleFlights = [
            {
                airline: 'Vietnam Airlines',
                flightNumber: 'VN210',
                departure: {
                    airport: 'SGN',
                    city: 'TP. Hồ Chí Minh',
                    time: '06:00',
                    date: createFlightDate('2025-01-15', '06:00')
                },
                arrival: {
                    airport: 'HAN',
                    city: 'Hà Nội',
                    time: '08:15',
                    date: createFlightDate('2025-01-15', '08:15')
                },
                duration: '2h 15m',
                price: 1850000,
                type: 'direct',
                availableSeats: 50,
                totalSeats: 180
            },
            {
                airline: 'VietJet Air',
                flightNumber: 'VJ123',
                departure: {
                    airport: 'SGN',
                    city: 'TP. Hồ Chí Minh',
                    time: '08:30',
                    date: createFlightDate('2025-01-15', '08:30')
                },
                arrival: {
                    airport: 'HAN',
                    city: 'Hà Nội',
                    time: '10:45',
                    date: createFlightDate('2025-01-15', '10:45')
                },
                duration: '2h 15m',
                price: 1650000,
                type: 'direct',
                availableSeats: 30,
                totalSeats: 180
            },
            {
                airline: 'Bamboo Airways',
                flightNumber: 'QH215',
                departure: {
                    airport: 'SGN',
                    city: 'TP. Hồ Chí Minh',
                    time: '14:00',
                    date: createFlightDate('2025-01-15', '14:00')
                },
                arrival: {
                    airport: 'HAN',
                    city: 'Hà Nội',
                    time: '16:15',
                    date: createFlightDate('2025-01-15', '16:15')
                },
                duration: '2h 15m',
                price: 1750000,
                type: 'direct',
                availableSeats: 75,
                totalSeats: 180
            },
            {
                airline: 'Vietnam Airlines',
                flightNumber: 'VN142',
                departure: {
                    airport: 'HAN',
                    city: 'Hà Nội',
                    time: '07:30',
                    date: createFlightDate('2025-01-15', '07:30')
                },
                arrival: {
                    airport: 'DAD',
                    city: 'Đà Nẵng',
                    time: '09:00',
                    date: createFlightDate('2025-01-15', '09:00')
                },
                duration: '1h 30m',
                price: 1450000,
                type: 'direct',
                availableSeats: 45,
                totalSeats: 160
            },
            {
                airline: 'VietJet Air',
                flightNumber: 'VJ556',
                departure: {
                    airport: 'SGN',
                    city: 'TP. Hồ Chí Minh',
                    time: '10:00',
                    date: createFlightDate('2025-01-15', '10:00')
                },
                arrival: {
                    airport: 'DAD',
                    city: 'Đà Nẵng',
                    time: '11:20',
                    date: createFlightDate('2025-01-15', '11:20')
                },
                duration: '1h 20m',
                price: 1250000,
                type: 'direct',
                availableSeats: 60,
                totalSeats: 180
            },
            {
                airline: 'Bamboo Airways',
                flightNumber: 'QH1201',
                departure: {
                    airport: 'SGN',
                    city: 'TP. Hồ Chí Minh',
                    time: '09:00',
                    date: createFlightDate('2025-01-15', '09:00')
                },
                arrival: {
                    airport: 'PQC',
                    city: 'Phú Quốc',
                    time: '10:00',
                    date: createFlightDate('2025-01-15', '10:00')
                },
                duration: '1h 00m',
                price: 1350000,
                type: 'direct',
                availableSeats: 85,
                totalSeats: 180
            },
            {
                airline: 'Vietnam Airlines',
                flightNumber: 'VN1823',
                departure: {
                    airport: 'HAN',
                    city: 'Hà Nội',
                    time: '15:30',
                    date: createFlightDate('2025-01-15', '15:30')
                },
                arrival: {
                    airport: 'CXR',
                    city: 'Nha Trang',
                    time: '17:30',
                    date: createFlightDate('2025-01-15', '17:30')
                },
                duration: '2h 00m',
                price: 1550000,
                type: 'direct',
                availableSeats: 40,
                totalSeats: 160
            }
        ];
        
        await Flight.insertMany(sampleFlights);
        console.log('✓ Flights seeded successfully');
        console.log(`   Created ${sampleFlights.length} flights`);
        console.log('   Example: VN210 departs at 06:00 Vietnam time (stored as 23:00 UTC previous day)');
    } catch (error) {
        console.error('Error seeding flights:', error);
    }
};

// Main seed function
const seedAll = async () => {
    console.log('Starting database seeding...');
    await connectDB();
    
    await seedAirports();
    await seedAirlines();
    await seedFlights();
    
    console.log('\n✓ Database seeding completed!');
    process.exit(0);
};

seedAll();

