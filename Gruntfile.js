/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['src/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        globals: {}
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib_test: {
        src: ['src/**/*.js', 'test/**/*.js']
      }
    },
    watch: {
      demo: {
        files: 'src/**/*.js',
        tasks: ['default']
      }
    },
    connect: {
      demo: {
        options: {
          port: '8069',
          hostname: '*',
          open: true,
          keepalive: false,
          base: {
            path: 'demo/',
            options: {
              index: 'consumer.html',
              maxAge: 300000
            }
          }
        }
      }
    },
    copy: {
        gruntfile: {
          files: [
            {
              expand:true,
              cwd: 'src/demo/',
              src: '**/*.html',
              dest: 'demo/'
            },
            {
              expand:true,
              cwd: 'dist/',
              src: '<%= pkg.name %>.min.js',
              dest: 'demo/lib'
            }
          ]
        }
      },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Default task.
  grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'copy']);
  grunt.registerTask('run', ['default','connect:demo', 'watch:demo']);
};
