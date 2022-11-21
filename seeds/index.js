const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

// Connecting to database

mongoose.connect('mongodb://localhost:27017/yelpCamp', {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', () => console.error.bind(console, 'Connection ERROR!'));
db.once('open', () => console.log('Database Connected'));

const sample = (array) => array[Math.floor(Math.random() * array.length)];
//console.log(places, descriptors);

const seedDb = async () => {
	await Campground.deleteMany({});
	for (i = 0; i < 200; i++) {
		const randomCities = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		const camp = new Campground({
			// MY USER ID
			author: '636549a14cbff6198906b796',
			location: `${cities[randomCities].city}, ${cities[randomCities].state}`,
			title: `${sample(places)} ${sample(descriptors)}`,
			geometry: {
				type: 'Point',
				coordinates: [
					cities[randomCities].longitude,
					cities[randomCities].latitude
				]
			},
			images: [
				{
					url: 'https://res.cloudinary.com/dwlznj3ky/image/upload/v1668357011/YelpCamp/hhxa5z0fevhm3iymadvs.jpg',
					filename: 'YelpCamp/hhxa5z0fevhm3iymadvs'
				},
				{
					url: 'https://res.cloudinary.com/dwlznj3ky/image/upload/v1668357051/YelpCamp/elufzjwdte8aqylilvfu.jpg',
					filename: 'YelpCamp/elufzjwdte8aqylilvfu'
				}
			],
			description:
				'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab, excepturi! Natus eum dolore a sequi beatae consequuntur quos aliquam! Nulla culpa architecto quas dignissimos doloribus ipsam quo, molestiae repellat at.',
			price: price
		});
		await camp.save();
	}
};

seedDb().then(() => {
	mongoose.connection.close();
});
