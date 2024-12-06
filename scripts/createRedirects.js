const fs = require('fs');
const path = require('path');

// Define the path to the 'build' directory where the _redirects file will be placed
const redirectsFilePath = path.join(__dirname, '../build/_redirects');

// Define the redirect rules
const redirectRules = '/*    /index.html   200';

// Ensure the _redirects file is created in the build directory
fs.writeFileSync(redirectsFilePath, redirectRules, 'utf8');
console.log('_redirects file created successfully!');
