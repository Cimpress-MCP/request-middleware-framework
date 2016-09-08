module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    // Loads values from package.json so they can be used within this file.
    pkg: grunt.file.readJSON("package.json"),
    // JSHint checks code quality.
    jshint: {
      files: [ "src/**/*.js", "!node_modules/**", "!coverage/**" ],
      options: {
        jshintrc: true
      }
    },
    // JSCS checks code style against standards.
    jscs: {
      main: [ "src/**/*.js", "!node_modules/**", "!coverage/**" ]
    },
    // Nodemon monitors the app for changes and will automatically restart the server.
    nodemon: {
      dev: {
        script: "src/app.js",
        options: {
          watch: [ "../" ],
          ignore: [ "node_modules/**", "Gruntfile.js" ],
          ext: "js,json,yaml",
          nodeArgs: [ "--debug" ]
        }
      }
    },
    // Node Inspector is a node.js debugger.
    "node-inspector": {
      dev: { }
    },
    // Concurrent allows grunt tasks to run concurrently.
    concurrent: {
      dev: [ "nodemon", "node-inspector" ],
      options: {
        logConcurrentOutput: true
      }
    },
    // Mocha is a test framework for node.js.
    mochaTest: {
      options: {
        timeout: 30000
      },
      test: {
        src: [ "src/test/**/*.js" ]
      }
    },
    // Istanbul is a code coverage tool for use with Mocha.
    mocha_istanbul: { // jscs:ignore requireCamelCaseOrUpperCaseIdentifiers
      coverage: {
        src: "src/test/**/*.js",
        options: {
          istanbulOptions: [ "--include-all-sources" ]
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-jscs");
  grunt.loadNpmTasks("grunt-nodemon");
  grunt.loadNpmTasks("grunt-node-inspector");
  grunt.loadNpmTasks("grunt-concurrent");
  grunt.loadNpmTasks("grunt-mocha-test");
  grunt.loadNpmTasks("grunt-mocha-istanbul");

  // Default task(s).
  grunt.registerTask("default", [ "jshint", "jscs", "test", "coverage" ]);
  grunt.registerTask("develop", [ "concurrent" ]);
  grunt.registerTask("test", [ "mochaTest:test" ]);
  grunt.registerTask("coverage", [ "mocha_istanbul" ]);
};
