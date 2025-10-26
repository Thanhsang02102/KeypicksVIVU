const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Airport = require('../models/Airport');
const Airline = require('../models/Airline');
const Flight = require('../models/Flight');

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

// Seed flights with data from JSON file
// Timestamps are in ISO 8601 format with timezone offset (e.g., "2025-10-27T06:00:00+07:00")
// JavaScript Date constructor automatically converts to UTC for MongoDB storage
const seedFlights = async () => {
    try {
        await Flight.deleteMany({});
        
        console.log('\n📅 Creating flight data from ISO timestamps...');
        console.log('   Timestamps include timezone offsets for international compatibility');
        console.log('   Database stores in UTC automatically\n');
        
        // Load flights data from JSON file
        const data = loadJSONFile('flights.json');
        
        // Map flights with timestamp conversion
        const flights = data.flights.map(flight => ({
            airline: flight.airline,
            flightNumber: flight.flightNumber,
            departure: {
                airport: flight.departure.airport,
                city: flight.departure.city,
                timestamp: new Date(flight.departure.timestamp)
            },
            arrival: {
                airport: flight.arrival.airport,
                city: flight.arrival.city,
                timestamp: new Date(flight.arrival.timestamp)
            },
            duration: flight.duration,
            type: flight.type,
            availableSeats: flight.availableSeats,
            totalSeats: flight.totalSeats
        }));
        
        await Flight.insertMany(flights);
        console.log('✓ Flights seeded successfully');
        console.log(`   Created ${flights.length} flights`);
        console.log('   All timestamps converted to UTC for storage');
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

