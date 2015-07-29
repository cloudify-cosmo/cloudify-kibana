'use strict';

module.exports = function(grunt){

    require('load-grunt-tasks')(grunt);


    var config = { kibanaHome: 'kibana/release/kibana-4.1.1' };
    if ( /darwin/.test(process.platform)) {
        config.kibanaUrl = 'https://www.dropbox.com/s/w0abtf9ko6p9vvk/kibana-4.1.1-darwin-x64.zip?dl=1';
    }

    else if ( /linux/.test(process.platform)){
        config.kibanaUrl = 'https://www.dropbox.com/s/wfdsumjlr5oeyzk/kibana-4.1.1-linux-x64.zip?dl=1';
    }else{
        grunt.log.error('platform unsupported!!');
        process.exit(1);
    }


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

        rename: {
            kibana: {
                src: 'kibana/release/kibana-4.1.1-' + process.platform + '-' + process.arch,
                dest: 'kibana/release/kibana-4.1.1'
            }
        },
        chmod: {
            kibana: {
                options: {
                    mode: '755'
                },
                // Target-specific file/dir lists and/or options go here.
                src: [ '.tmp/' + config.kibanaHome + '/bin/kibana', '.tmp/' + config.kibanaHome + '/node/bin/*']
            }
        },
        wget:{
            kibana: { // grunt connect:kibana:keepalive
                files: {
                    'kibana/archive.zip' : config.kibanaUrl
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
                    '.tmp/kibana/release/kibana-4.1.1/src/public/styles/cloudify.css': 'app/styles/main.scss'
                }
            }
        },

        copy: {

            // does not keep file permissions :(
            // https://github.com/gruntjs/grunt-contrib-copy/issues/239
            kibana: {
                files: [
                    // includes files within path
                    {expand: true, src: ['kibana/release/kibana-4.1.1/**/*'], dest: '.tmp/','mode': true}
                ]
            },
            kibanaIndex: { // copy index since index is overriden by 'insert' we want to be able to roll back only that
                    files: [{expand: true, src: ['kibana/release/kibana-4.1.1/**/index.html'], dest: '.tmp/'}]
            },
            dist: {
                files: [
                    {expand:true, cwd:'.tmp/kibana/release/kibana-4.1.1', src:['**'], dest:'dist/kibana'},
                    {src:['package.json'], dest:'dist/package.json'}
                ]
            },
            artifacts: {
                files: [
                    {expand:true, cwd: 'dist', 'src' : ['*.tgz'], dest: 'artifacts'}
                ]
            }
        },

        shell: {
            npmPack: {
                command: 'npm pack',
                options: {
                    execOptions: {
                        cwd: 'dist'
                    }
                }
            }
        },

        clean: {
            all: {
                src: ['.tmp','dist']
            },
            kibana : {
                src: ['kibana','.tmp/kibana']
            },
            artifacts: {
                src: ['artifacts','dist/cloudify-kibana*.tgz']
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
                dest: '.tmp/kibana/release/kibana-4.1.1/src/public/index.html',
                match:new RegExp('(<link rel="stylesheet" href="styles/main.css\\?_b=[0-9]+">)')
            }
        },
        aws_s3: {
            options: {
                accessKeyId: '<%= aws.accessKey %>', // Use the variables
                secretAccessKey: '<%= aws.secretKey %>', // You can also use env variables
                region: '<%= aws.region %>',
                access: 'public-read',
                uploadConcurrency: 5, // 5 simultaneous uploads
                downloadConcurrency: 5 // 5 simultaneous downloads
            },
            uploadArtifacts: {
                options: {
                    bucket: '<%= aws.bucket %>'
                },
                files: [
                    {dest: '<%= aws.folder %>', cwd: './artifacts' , expand:true, src:['**'],action: 'upload'}
                ]
            }
        }
    });

    grunt.registerTask('readS3Keys', function(){
        var s3KeysFile = process.env.AWS_JSON || './dev/aws-keys.json';
        grunt.log.ok('reading s3 keys from [' + s3KeysFile  + ']' );
        grunt.config.data.aws =  grunt.file.readJSON( s3KeysFile ); // Read the file
    });

    grunt.registerTask('pack', [ 'clean:artifacts','build', 'shell:npmPack','copy:artifacts']);

    grunt.registerTask('uploadArtifacts', [ 'readS3Keys','aws_s3:uploadArtifacts']);

    grunt.registerTask('buildAndUpload', ['pack','uploadArtifacts']);

    grunt.registerTask('server', ['newer:copy:kibana','copy:kibanaIndex', 'chmod:kibana','insert:kibanaIndex', 'sass','open:kibana', 'runKibanaServer', 'watch:sass']);


    grunt.registerTask('build', [
        'clean:all','newer:copy:kibana','copy:kibanaIndex', 'insert:kibanaIndex', 'sass', 'copy:dist'
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

            var kibanaBin = path.join(__dirname, root + '/release/kibana-4.1.1/bin/kibana');

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

    grunt.registerTask('setupKibana', [ 'clean:kibana','wget:kibana', 'unzip:kibana', 'rename:kibana' ]);

    grunt.registerTask('default',[ 'jshint' ]);
};
