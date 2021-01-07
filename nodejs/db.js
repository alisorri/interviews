//TODO: 1. add the certeficate thing to the connection.
//2. grep the conf from file.
var mysql = require('mysql');
const fs = require('fs');

exports.DbConnection = function (db_options,conLimit,callback) {
	let _this=this;
    const state = {
        pool: null,
    };
    this.conLimit =conLimit;
    this.callback = callback;
	this.isConncted=false;
	this.conns={};
	this.last_query=0;
    this.connect =  () => {
        this.dbOptions.connectionLimit = 3;
        state.pool = mysql.createPool(
            this.dbOptions
        );

        state.pool.on('connection', (connection) => {
            connection.query("SET @@session.time_zone =(SELECT config_value FROM config WHERE config_name='timezone')")
            // option before connection
            //console.log('state.pool.on Connection');
        });

        state.pool.on('error', (error) => {
            console.log('pool error', error);
            // option before connection
        });

        state.pool.on('acquire', (connection) => {
            //console.log('Connection %d acquired', connection.threadId);
			_this.conns[connection.threadId] = true;
        });

        state.pool.on('enqueue', () => {
            // console.log('Waiting for available connection slot');
            console.log('Waiting for available connection slot');
        });

        state.pool.on('release', (connection) => {
            //console.log('Connection %d released', connection.threadId);
			_this.conns[connection.threadId] = false;
        });

        console.log('db connected : ', this.dbOptions.database);
		this.isConncted=true;
    };

    this.get = function () {
        return state.pool;
    };
		
	this.disconnect= function(){
		this.isConncted=false;
		state.pool.end();
		console.log("db disconnect: ",this.dbOptions.database);
	};
	
    this.dbOptions = db_options;
    
	
	setInterval(function(){
		if (_this.isConncted){
			let time_pass_last_query = Math.floor(new Date() / 1000) - _this.last_query;
			if (time_pass_last_query >= 5){
				for(let i in _this.conns){
					if (_this.conns[i]){
						console.log("connection stil in_use : ",_this.dbOptions.database,i);
						return;
					}
				}
				_this.disconnect();
			}
		}
	},5*1000);

    this.runQuery = function (query, values, success, fail, db_options) {
		if (!this.isConncted)
			this.connect();
		this.last_query = Math.floor(new Date() / 1000);
        this.get().query(query, values, (err, rows, field) => {
            if (err) {
                fail(err);
            } else {
                success(rows);
            }

        });
    }



}

