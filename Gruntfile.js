'use strict';

module.exports = function(grunt){

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

        'jshint' : {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [ 'Gruntfile.js' ]
        },
        unzip: {
            kibana: {
                dest: 'kibana/release/',
                src : 'kibana/archive.zip'
            }
        },
        wget:{
            kibana: { // grunt connect:kibana:keepalive
                files: {
                    'kibana/archive.zip' : 'https://www.dropbox.com/s/wfdsumjlr5oeyzk/kibana-4.1.1-linux-x64.zip?dl=1'
                }
            }
        },

        connect: {
            kibana: {
                options: {
                    port: 9001,
                    base: 'kibana/release'
                }
            }
        },
        open : {
            kibana: {
                path: 'http://127.0.0.1:5601',
                options: {
                    openOn: 'serverListening'//,
                    //delay: 1000
                }
            }
        }
    });

    grunt.registerTask('runKibanaServer', function () {

        var spawn = require('child_process').spawn;
        var path = require('path');
        var kibanaBin = path.join(__dirname, 'kibana/release/kibana-4.1.1-linux-x64/bin/kibana');
        console.log('running kibana from', kibanaBin);
        var server = spawn(kibanaBin);
        var opened = false;
        server.stdout.on('data', function (data) {
            console.log(data.toString());
            if ( data.toString().indexOf('Listening on 0.0.0.0:5601') >= 0) {
                if (!opened) {
                    opened = true;
                    console.log('server is listening');
                    grunt.event.emit('serverListening'); // triggers open:delayed
                }
            }



            //grunt.event.emit('serverListening'); // triggers open:delayed
        });
        server.stderr.on('data', function (data) {
            console.log(data.toString());

        });


        process.on('exit', function () {
            grunt.log.writeln('killing myserver...');
            server.kill();
            grunt.log.writeln('killed myserver');
        });

    });


    grunt.registerTask('kibanaServer', [ 'runKibanaServer','open:kibana','keepalive']);




    grunt.registerTask('setupKibana', [ 'wget:kibana', 'unzip:kibana' ]);


    grunt.registerTask('default',[ 'jshint' ]);
};
