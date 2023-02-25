const mix = require('laravel-mix');

require('laravel-mix-obfuscator');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.styles([
    'assets/css/bootstrap.min.css',
    'assets/css/notyf.min.css',
    'assets/css/datatables.min.css',
    'assets/fonts/remixicon.css',
    'assets/css/perfect-scrollbar.css',
    'assets/css/styles.css',
], 'dist/css/all.css');


mix.scripts([
    'assets/js/bootstrap.bundle.min.js',
    'assets/js/moment.min.js',
    'assets/js/datatables.min.js',
    'assets/js/perfect-scrollbar.min.js',
    'assets/js/notyf.min.js',
    'src/script.js',
    'src/lib.js',
], 'dist/js/all.js');

mix.scripts([
    'src/background.js',
], 'dist/js/background.js').obfuscator();

mix.minify('dist/js/all.js').obfuscator();
mix.minify('dist/css/all.css');