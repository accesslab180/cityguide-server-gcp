const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static('public'));
const mariadb = require('mariadb');

const config = require('./config');

const username = config.username;
const password = config.password;
const host = config.host;
const port = config.port;

const PORT = 3000;

app.set("view engine", "ejs")

	app.get('/', function (req, res) {
		res.render('pages/index');
	});




	app.post('/getinfo', async (req, res) => {
		console.log(req.body);
		const pool = mariadb.createPool({
			host: host,
			user:username,
			password: password,
			port:port,
			trace: true,	
		
		});
		let conn;
		try{
			conn = await pool.getConnection();
			const rows = await conn.query(`SELECT * from CityGuide.${req.body.requestedTable}`);
			res.json(rows);

		}catch(err){
			console.error(err); // Log the error
			res.status(500).json({ error: 'An error occurred' });
		} finally{
			if (conn) conn.release();
		}
	});


//***************************************************************************//
// Handle POST requests for the list of beacons and files

app.post('/list', async (req, res) => {
	const pool = mariadb.createPool({
		host: host,
		user:username,
		password: password,
		port:port,
		trace: true,	
	
	});
	let conn;
	try{
		conn = await pool.getConnection();
		queryA = 'SELECT * FROM CityGuide.envisionBeacons';
		queryB = 'SELECT * FROM CityGuide.envisionBeaconData';
		const records = await conn.query(queryA);
		
		var htmlToSend1;
		var htmlToSend2;
		if (records.length > 0) {
		htmlToSend1 = `<!DOCTYPE html>
			<html lang="en">
			<head>
			<title>List of Beacons & Files</title>
			</head>
			<body>
			<div id="searchbox">
			<h1>Beacon Groups & Files</h1>
			<table>
			<tr>
			<th>Group ID</th>
			<th>Group Name</th>
			<th>Floor Number</th>
			<th>Floor File</th>
			<th>Beacon File</th>
			</tr>`;
		}
		for (var i = 0; i < records.length; i++){
			htmlToSend1 = htmlToSend1 + `
			<tr>
			<td>${records[i].group_id}</td>
			<td>${records[i].group_name}</td>
			<td>${records[i].floor_num}</td>
			<td>${records[i].floor_file}</td>
			<td>${records[i].beacon_file}</td>
			</tr>`;
		}

		setTimeout(async() => {
			const rows2 = await conn.query(queryB);
			if (rows2.length > 0) {
				htmlToSend2 =  `</table></div>
					<div id="searchbox">
					<h1>Beacons</h1>
					<table>
					<tr>
					<th>Beacon ID</th>
					<th>Group ID</th>
					<th>Node</th>
					<th>Numsens</th>
					<th>Threshold</th>
					<th>Direction</th>
					<th>Location Name</th>
					<th>Other</th>
					<th>Level</th>
					<th>BNorth</th>
					<th>NDist</th>
					<th>BSouth</th>
					<th>SDist</th>
					<th>BEast</th>
					<th>EDist</th>
					<th>BWest</th>
					<th>WDist</th>
					<th>BNEast</th>
					<th>NEastDist</th>
					<th>BNWest</th>
					<th>NWestDist</th>
					<th>BSEast</th>
					<th>SEastDist</th>
					<th>BSWest</th>
					<th>SWestDist</th>
					</tr>`;
				}
			for (var i = 0; i < rows2.length; i++){
				htmlToSend2 = htmlToSend2 + `
				<tr>
				<td>${rows2[i].beacon_id}</td>
				<td>${rows2[i].group_id}</td>
				<td>${rows2[i].node}</td>
				<td>${rows2[i].numsens}</td>
				<td>${rows2[i].threshold}</td>
				<td>${rows2[i].direction}</td>
				<td>${rows2[i].locname}</td>
				<td>${rows2[i].other}</td>
				<td>${rows2[i]._level}</td>
				<td>${rows2[i].bnorth}</td>
				<td>${rows2[i].ndist}</td>
				<td>${rows2[i].bsouth}</td>
				<td>${rows2[i].sdist}</td>
				<td>${rows2[i].beast}</td>
				<td>${rows2[i].edist}</td>
				<td>${rows2[i].bwest}</td>
				<td>${rows2[i].wdist}</td>
				<td>${rows2[i].bneast}</td>
				<td>${rows2[i].neastdist}</td>
				<td>${rows2[i].bnwest}</td>
				<td>${rows2[i].nwestdist}</td>
				<td>${rows2[i].bseast}</td>
				<td>${rows2[i].seastdist}</td>
				<td>${rows2[i].bswest}</td>
				<td>${rows2[i].swestdist}</td>
				</tr>`;
			}
	
			setTimeout(function(){
				console.log("Beacons Fetched");
			}, 500);

			}, 250);

			setTimeout(function(){

			// 	// End of html
				var htmlToSend = htmlToSend1 + htmlToSend2 + `
				</table>
				</div>
				<a href="javascript:history.back()">Go Back</a>
				</body>
				</html>
				`;
				res.send(htmlToSend);
			}, 750);
	} catch (err){
		console.log(err);
		res.send(`<p>There was an issue displaying the data: ${err}</p>
			<a href="javascript:history.back()">Go Back</a>`);
	} finally {
		if (conn) pool.end();
	}

});

// //***************************************************************************//
// // Handle POST requests for inserting a file into the database
// app.post('/fileinsert', function (req, res) {

// 	// POST variables
// 	var groupid = req.body.gid;
// 	var groupname = req.body.gname;
// 	var flrno = req.body.fno;
// 	var flrfile = req.body.flrfile;
// 	var bfile = req.body.bfile;
// 	var auth = req.body.auth;

// 	// Database Information
// 	const config = {
// 		user: 'u7qrv37hs3aci78',
// 		password: 'eocPixaq*FaXLP09N9cWKonIB',
// 		server: 'eu-az-sql-serv1.database.windows.net',
// 		database: 'd8okww2yobamfsq',
// 		// "options": {
//         // "encrypt": true,
//         // "enableArithAbort": true
//         // },
// 		port: 1433
// 	};

// 	try{
// 		// Connect to database
// 		mssql.connect(config, function (err){

// 			// Create request handler and query to insert file
// 			// IF THE ORDER OF THE COLUMNS IN THE DATABASE EVER CHANGE, THE ORDER HERE WILL NEED TO REFLECT THAT
// 			var request = new mssql.Request();
// 			var ins_query = `INSERT INTO dbo.envisionBeacons VALUES (${groupid}, '${groupname}',${flrno},'${flrfile}','${bfile}')`;
// 			// var ins_query = `INSERT INTO dbo.beacons VALUES (${groupid}, '${groupname}',${flrno},'${flrfile}','${bfile}')`;
// 			// Query to insert file
// 			request.query(ins_query,
// 			function (err, records) {
// 				try{
// 					if (err){
// 						console.log(err);
// 						throw err;
// 					}

// 					res.send(`<p>Successfully inserted group id ${groupid} into the database</p>
// 						<a href="javascript:history.back()">Go Back</a>`);
// 				}
// 				catch(err){
// 					res.send(`<p>There was an issue adding the file to the database: ${err}</p>
// 						<a href="javascript:history.back()">Go Back</a>`);
// 				}
// 			});

// 			setTimeout(function(){
// 			mssql.close()
// 			}, 3000);

// 		});
// 	}
// 	catch(err){
// 		res.send(`<p>There was an issue adding to the database: ${err}</p>
// 			<a href="javascript:history.back()">Go Back</a>`);
// 	}
// });

// //***************************************************************************/
// // Handle POST requests for inserting beacon data into database

// app.post('/beaconinsert', function (req, res) {

// 	//POST variables
// 	//IF THE NAME AND ID OF THE WEB FORM EVER GET CHANGED, THE NAMES OF THESE REQ.BODY ATTRIBUTES WILL NEED TO MATCH THEM 
// 	var beaconid = req.body.bid;
// 	var beaconname = req.body.bname;
// 	var groupid = req.body.gid;
// 	var node = req.body.node;
// 	var sens = req.body.sens;
// 	var thresh = req.body.thresh;
// 	var drn = req.body.drn;
// 	var lname = req.body.lname;
// 	var other = req.body.other;
// 	var lvl = req.body.lvl;
// 	var bn = req.body.bn;
// 	var nd = req.body.nd;
// 	var bs = req.body.bs;
// 	var sd = req.body.sd;
// 	var be = req.body.be;
// 	var ed = req.body.ed;
// 	var bw = req.body.bw;
// 	var wd = req.body.wd;
// 	var bne = req.body.bne;
// 	var ned = req.body.ned;
// 	var bnw = req.body.bnw;
// 	var nwd = req.body.nwd;
// 	var bse = req.body.bse;
// 	var sed = req.body.sed;
// 	var bsw = req.body.bsw;
// 	var swd = req.body.swd;
// 	var auth = req.body.auth;


// 	// Database Information
// 	const config = {
// 		user: 'u7qrv37hs3aci78',
// 		password: 'eocPixaq*FaXLP09N9cWKonIB',
// 		server: 'eu-az-sql-serv1.database.windows.net',
// 		database: 'd8okww2yobamfsq',
// 		// "options": {
//         // "encrypt": true,
//         // "enableArithAbort": true
//         // },
// 		port: 1433
// 	};

// 	try{
// 		// Connect to database
// 		mssql.connect(config, function (err){

// 			// Create request handler and query to insert beacon data
// 			// IF THE ORDER OF COLUMNS IN THE DATABASE CHANGE, THE ORDER HERE WILL NEED TO REFLECT THAT
// 			var request = new mssql.Request();
// 			var ins_query = `INSERT INTO dbo.envisionBeaconData VALUES ('${beaconid}', ${groupid}, ${node}, ${sens}, ${thresh}, ${drn}, '${lname}', '${other}', ${lvl}, ${bn}, ${nd}, ${bs}, ${sd}, ${be}, ${ed}, ${bw}, ${wd}, ${bne}, ${ned}, ${bnw}, ${nwd}, ${bse}, ${sed}, ${bsw}, ${swd})`;
// 			// var ins_query = `INSERT INTO dbo.beacondata VALUES ('${beaconid}', ${groupid}, ${node}, ${sens}, ${thresh}, ${drn}, '${lname}', '${other}', ${lvl}, ${bn}, ${nd}, ${bs}, ${sd}, ${be}, ${ed}, ${bw}, ${wd}, ${bne}, ${ned}, ${bnw}, ${nwd}, ${bse}, ${sed}, ${bsw}, ${swd})`;

// 			// Query to insert beacon data
// 			request.query(ins_query, function (err, records) {
// 				try{
// 					if (err){
// 						console.log(err);
// 						throw err;
// 					}

// 					res.send(`<p>Successfully inserted beacon ${beaconid} into the database</p>
// 						<a href="javascript:history.back()">Go Back</a>`);					
// 				}
// 				catch(err){
// 					res.send(`<p>There was an issue adding to the database: ${err}</p>
// 						<a href="javascript:history.back()">Go Back</a>`);
// 				}
// 			});
// 				setTimeout(function(){
// 				mssql.close()
// 				}, 500);

// 		});
// 	}
// 	catch(err){
// 		console.log(`There was an issue adding to the database: ${err}`);
// 		res.send(`<p>There was an issue adding to the database: ${err}</p>
// 			<a href="javascript:history.back()">Go Back</a>`);
// }
// });

// //***************************************************************************//
// // Handle POST requests to delete beacons from the database
// app.post('/delete', function (req, res) {

// 	// POST variables
// 	var bid = req.body.bid;
// 	var auth = req.body.auth;

// 	// Database Information
// 	const config = {
// 		user: 'u7qrv37hs3aci78',
// 		password: 'eocPixaq*FaXLP09N9cWKonIB',
// 		server: 'eu-az-sql-serv1.database.windows.net',
// 		database: 'd8okww2yobamfsq',
// 		// "options": {
//         // "encrypt": true,
//         // "enableArithAbort": true
//         // },
// 		port: 1433
// 	};

// 	try {
// 		// Connect to database
// 		mssql.connect(config, function (err){

// 			// Create request handler and query for deleting beacons
// 			var request = new mssql.Request();
// 			var queryd = `DELETE FROM dbo.envisionBeaconData WHERE beacon_id = '${bid}'`;
// 			// var queryd = `DELETE FROM dbo.beacondata WHERE beacon_id = '${bid}'`;

// 			// To delete groups of beacons from the file table:
// 			// var queryf = `DELETE FROM dbo.beacons WHERE group_id = ${bid}`;
// 			// request.query(queryf, function (err, records){
// 			// 	if (err) throw err;
// 			// });
			
// 			// Query to delete beacons
// 			request.query(queryd, function (err, records){
// 				if (err) throw err;

// 				res.send(`<p>Successfully deleted beacon id '${bid}' from the database.</p>
// 					<a href="javascript:history.back()">Go Back</a>`);
// 			});

// 			setTimeout(function(){
// 				mssql.close();
// 				}, 500);
// 		});
		

// 	}
// 	catch(err){
// 		console.log(`There was an issue deleting from the database: ${err}`);
// 		res.send(`<p>There was an issue deleting from the database: ${err}</p>
// 			<a href="javascript:history.back()">Go Back</a>`);
// 	}
// });
// //---
// app.post('/gdelete', function (req, res) {

// 	// POST variables
// 	var gid = req.body.gid;
// 	var auth = req.body.auth;

// 	// Database Information
// 	const config = {
// 		user: 'u7qrv37hs3aci78',
// 		password: 'eocPixaq*FaXLP09N9cWKonIB',
// 		server: 'eu-az-sql-serv1.database.windows.net',
// 		database: 'd8okww2yobamfsq',
// 		// "options": {
//         // "encrypt": true,
//         // "enableArithAbort": true
//         // },
// 		port: 1433
// 	};

// 	try {
// 		// Connect to database
// 		mssql.connect(config, function (err){

// 			// Create request handler and query for deleting beacons
// 			var request = new mssql.Request();
// 			var queryd = `DELETE FROM dbo.envisionBeacons WHERE group_id = ${gid}`;

// 			// To delete groups of beacons from the file table:
// 			// var queryf = `DELETE FROM dbo.beacons WHERE group_id = ${bid}`;
// 			// request.query(queryf, function (err, records){
// 			// 	if (err) throw err;
// 			// });
			
// 			// Query to delete beacons
// 			request.query(queryd, function (err, records){
// 				if (err) throw err;

// 				res.send(`<p>Successfully deleted group id ${gid} from the database.</p>
// 					<a href="javascript:history.back()">Go Back</a>`);
// 			});

// 			setTimeout(function(){
// 				mssql.close();
// 				}, 500);
// 		});
		

// 	}
// 	catch(err){
// 		console.log(`There was an issue deleting from the database: ${err}`);
// 		res.send(`<p>There was an issue deleting from the database: ${err}</p>
// 			<a href="javascript:history.back()">Go Back</a>`);
// 	}
// });


//***************************************************************************//
///////////////////the following sections are used in mobile app code
//***************************************************************************//
// Handle POST requests for downloading files for beacons

app.post('/beacon', async (req,res) => {
	var auth = req.body.auth;
	var gid = req.body.gid;
	var fno = req.body.fno;
	var beacons;
	var lat = req.body.lat;
	var long = req.body.long;
	lat = Number((lat.toString()).substring(0,5));
	long = Number((long.toString()).substring(1,6));
	

	let currentTables = selectTables(lat,long);

	const pool = mariadb.createPool({
		host: host,
		user:username,
		password: password,
		port:port,
		trace: true,	
	});

	let conn;
	try{
		conn = await pool.getConnection();
		query = `SELECT beacon_file from CityGuide.${currentTables.beacon_table} WHERE group_id = ${gid} AND floor_num = ${fno}`;

		const rows = await conn.query(query);
		try{
			if (rows.length > 0){
				var fileName = 'beaconfiles/' + rows[0].beacon_file;
				res.download(fileName, function (derr) {
					if (derr) {
						throw(derr);
					}else {
					console.log(`Successfully sent ${fileName} for download.`)
					}
				});

			}else{
				res.send(`<p>There are no files with that group ID.</p>
						<a href="javascript:history.back()">Go Back</a>`);	

			}
		}catch(err){
			console.log(`There was an error: ${err}`);
					res.send(`<p>There was an error. Make sure the group ID is correct: ${err}</p>`);
		}
		
	}catch(err){
		console.log(`There was an issue connecting to the database, check the authorization: ${err} `);
		res.send(`<p>There was an issue connecting to the database, check the authorization: ${err}</p>
				<a href="javascript:history.back()">Go Back</a>`);
	}finally {
		if (conn) pool.end();
	}

});

// //***************************************************************************//
// Handle POST requests for downloading files for beacons

app.post('/floor', async (req,res) => {
	var auth = req.body.auth;
	var gid = req.body.gid;
	var fno = req.body.fno;
	var beacons;
	var lat = req.body.lat;
	var long = req.body.long;
	lat = Number((lat.toString()).substring(0,5));
	long = Number((long.toString()).substring(1,6));
	let currentTables = selectTables(lat,long);
	
	const pool = mariadb.createPool({
		host: host,
		user:username,
		password: password,
		port:port,
		trace: true,	
	});

	let conn;
	try{
		conn = await pool.getConnection();
		var query = `SELECT floor_file from CityGuide.${currentTables.beacon_table} WHERE group_id = ${gid} AND floor_num = ${fno}`;
		const rows = await conn.query(query);
		try{
			if (rows.length > 0){
				var fileName = 'beaconfiles/' + rows[0].floor_file;
				res.download(fileName, function (derr) {
					if (derr) {
						throw(derr);
					}else {
					console.log(`Successfully sent ${fileName} for download.`)
					}
				});

			}else{
				res.send(`<p>There are no files with that group ID.</p>
						<a href="javascript:history.back()">Go Back</a>`);	

			}
		}catch(err){
			console.log(`There was an error: ${err}`);
					res.send(`<p>There was an error. Make sure the group ID is correct: ${err}</p>`);
		}

	}catch(err){
		console.log(`There was an issue connecting to the database, check the authorization: ${err} `);
		res.send(`<p>There was an issue connecting to the database, check the authorization: ${err}</p>
			<a href="javascript:history.back()">Go Back</a>`);
	}finally {
		if (conn) pool.end();
	}
});

//***************************************************************************//
// Handle POST requests for beacon data

app.post('/data', async (req, res) => {
	
	// POST variables
	// IF THE NAME OF THE POST VARIABLES GET CHANGED ON THE WEB FORM, THEY (REQ.BODY) WILL NEED TO MATCH HERE
	var auth = req.body.auth;
	var beaconid = req.body.beaconid;
	var beaconData;
	var lat = req.body.lat;
	var long = req.body.long;
	lat = Number((lat.toString()).substring(0,5));
	long = Number((long.toString()).substring(1,6));
	let currentTables = selectTables(lat,long);

	const pool = mariadb.createPool({
		host: host,
		user:username,
		password: password,
		port:port,
		trace: true,	
	
	});
	
	let conn;
	try{

		conn = await pool.getConnection();
		var queryA = `SELECT * FROM CityGuide.${currentTables.beacon_data_table} WHERE beacon_id = ${beaconid}`;
		const rows = await conn.query(queryA);
		if (rows.length > 0) {
			let records = {
				recordsets: [[]],
				recordset:[],
				output: {},
				rowsAffected: [rows.length]
			};

			for (let i=0;i<rows.length;i++){
				records.recordset.push(rows[i]);
				records.recordsets[0].push(rows[i]);
			}
			res.send(records);
			console.log(`Successfully sent '${records}' for '${beaconid}'`);
		}else{
			throw 'Beacon ID not found in database';
		}


	}catch(err){
		console.log(`There was an issue connecting to the database, check the authorization: ${err} `);
		res.send(`<p>There was an issue connecting to the database, check the authorization: ${err}</p>
			<a href="javascript:history.back()">Go Back</a>`);
	}finally {
		if (conn) pool.end();
	}

});

// Handles feedback requests

app.post('/sendFeedback', async(req,res) => {

	var feedback_table;
	var {date, stars, comment, lat, long} = req.body;
	lat = Number((lat.toString()).substring(0,5));
	long = Number((long.toString()).substring(1,6));

	let currentTables = selectTables(lat,long);

	const pool = mariadb.createPool({
		host: host,
		user:username,
		password: password,
		port:port,
		trace: true,	
	
	});

	let conn;
	try{
		conn = await pool.getConnection();
		var query = `INSERT INTO CityGuide.${currentTables.feedback_table} VALUES('${date}', ${stars}, '${comment}')`;
		const result = await conn.query(query);
		console.log(result);
		res.status(200).json({ message: 'Data successfully stored' });
			
	}catch(err){
		console.log(err);
	}

});


// Start up web server and begin listening on port 5000
var server = app.listen(PORT, '0.0.0.0', function() {
	console.log(`Server is listening at port ${PORT}`);
});

function selectTables(lat, long){

	var tables = {
		beacon_table: '',
		beacon_data_table: '',
		feedback_table: ''
	}

	var location = [{
		location_id : 1,
		location_name: 'Wichita State University',
		location_lat: 37.71,
		location_long: 97.29,
		beaconTable: 'wallacehallBeacons',
		beaconDataTable: 'wallacehallBeaconData',
		feedbackTable: 'wallacehallFeedback'
	},{
		location_id : 2,
		location_name: 'Envision HQ',
		location_lat: 37.69,
		location_long: 97.33,
		beaconTable: 'envisionBeacons',
		beaconDataTable: 'envisionBeaconData',
		feedbackTable: 'envisionFeedback'
	},{
		location_id : 3,
		location_name: 'Envision Art Gallery',
		location_lat: 37.68,
		location_long: 97.32,
		beaconTable: 'envisionBeacons',
		beaconDataTable: 'envisionBeaconData',
		feedbackTable: 'envisionFeedback'
	},{
		location_id : 4,
		location_name: 'Lehigh University',
		location_lat: 40.60,
		location_long: 75.37,
		beaconTable: 'hstBeacons',
		beaconDataTable: 'hstBeaconData',
		feedbackTable: 'hstFeedback'
	
	},
	{
		location_id : 5,
		location_name: `Badri's Home`,
		location_lat: 40.60,
		location_long: 75.38,
		beaconTable: 'hstBeacons',
		beaconDataTable: 'hstBeaconData',
		feedbackTable: 'hstFeedback'
	
	
	}];


	for(i=0;i<location.length;i++){
		if(location[i]["location_lat"] == lat && location[i]["location_long"] == long){
			tables.beacon_table = location[i]["beaconTable"];
			tables.beacon_data_table = location[i]["beaconDataTable"];
			tables.feedback_table = location[i]["feedbackTable"];
			break;
		}
	}

	return tables;
}