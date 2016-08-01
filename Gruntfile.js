module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/j/<%= pkg.name %>.js',
                dest: 'gen/j/<%= pkg.name %>.min.js'
            }
        },
        jasmine: {
            src: 'src/**/*.js',
            options: {
                specs: 'spec/**/*.js'
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Load the plugin that provides the "unit tests" task by jasmin
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    // Default task(s).
    grunt.registerTask('default', ['uglify']);
    grunt.registerTask('test', ['jasmine']);

};
