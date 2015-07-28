'use strict';

module.exports = function(grunt){

    require('load-grunt-tasks')(grunt);


    var KIBANA_HOME='kibana/release/kibana-4.1.1-linux-x64';

    grunt.initConfig({

        'jshint' : {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [ 'Gruntfile.js' ]
        },
        unzip: {

            // issues with file permissions after unzip
            // https://github.com/twolfson/grunt-zip/issues/37
            // https://github.com/EvanOxfeld/node-unzip/issues/6
            // since it is originated in node and not in the grunt plugin, there's no currect clean solution, so we chmod manually

            kibana: {
                dest: 'kibana/release/',
                src : 'kibana/archive.zip'
            }
        },
        chmod: {
            kibana: {
                options: {
                    mode: '755'
                },
                // Target-specific file/dir lists and/or options go here.
                src: [ KIBANA_HOME + '/bin/kibana', KIBANA_HOME + '/node/bin/*', '.tmp/' + KIBANA_HOME + '/bin/kibana', '.tmp/' + KIBANA_HOME + '/node/bin/*']
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
        },

        sass: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    '.tmp/kibana/release/kibana-4.1.1-linux-x64/src/public/styles/cloudify.css': 'app/styles/main.scss'
                }
            }
        },

        copy: {

            // does not keep file permissions :(
            // https://github.com/gruntjs/grunt-contrib-copy/issues/239
            kibana: {
                files: [
                    // includes files within path
                    {expand: true, src: ['kibana/release/kibana-4.1.1-linux-x64/**/*'], dest: '.tmp/','mode': true}
                ]
            },
            kibanaIndex: { // copy index since index is overriden by 'insert' we want to be able to roll back only that
                    files: [{expand: true, src: ['kibana/release/kibana-4.1.1-linux-x64/**/index.html'], dest: '.tmp/'}]
            }
        },


        clean: {
            all: {
                src: ['.tmp','dist']
            },
            kibana : {
                src: ['kibana','.tmp/kibana']
            }
        },

        watch: {
            sass: {
                files: ['app/styles/**/*.scss'],
                tasks: ['sass']
            }
        },

        insert: {
            options: {},
            kibanaIndex: {
                src: 'src/html_changes/cloudify_css_index_header.html',
                dest: '.tmp/kibana/release/kibana-4.1.1-linux-x64/src/public/index.html',
                match:new RegExp('(<link rel="stylesheet" href="styles/main.css\\?_b=[0-9]+">)')
            }
        }
    });

    grunt.registerTask('server', ['newer:copy:kibana','copy:kibanaIndex', 'chmod:kibana','insert:kibanaIndex', 'sass','open:kibana', 'runKibanaServer', 'watch:sass']);


    grunt.registerTask('build', [
        'newer:copy:kibana','copy:kibanaIndex', 'insert:kibanaIndex', 'sass'
    ]);

    grunt.registerTask('serve', ['server']);

    // runs the kibana server
    grunt.registerTask('runKibanaServer', function ( target ) {

        try {
            var root = '.tmp/kibana';

            if (target === 'orig') {
                root = 'kibana';
            }

            var spawn = require('child_process').spawn;
            var path = require('path');

            var kibanaBin = path.join(__dirname, root + '/release/kibana-4.1.1-linux-x64/bin/kibana');

            grunt.log.ok('running kibana', kibanaBin);
            var server = spawn(kibanaBin);
            var opened = false;
            server.stdout.on('data', function (data) {
                console.log(data.toString());
                if (data.toString().indexOf('Listening on 0.0.0.0:5601') >= 0) {
                    if (!opened) {
                        opened = true;
                        console.log('server is listening');
                        grunt.event.emit('serverListening'); // triggers open:delayed
                    }
                }

                if ( data.toString().indexOf('Unable to connect to elasticsearch') >= 0){
                    grunt.log.error('elasticsearch is down!');
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
        }catch(e){
            grunt.log.error('unable to run kibana server',e);
        }

    });



    grunt.registerTask('kibanaServer', [ 'runKibanaServer','open:kibana','keepalive']);


    grunt.registerTask('setupKibana', [ 'wget:kibana', 'unzip:kibana', 'chmod:kibana' ]);

    grunt.registerTask('default',[ 'jshint' ]);
};
