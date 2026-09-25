const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf8');

appJs = appJs.replace(
  '<!-- Floating Badges -->',
  '</div>\n<!-- Floating Badges -->'
);

appJs = appJs.replace(
  '          </div>\n        </div>\n      </div>',
  '          </div>\n      </div>'
);

fs.writeFileSync('app.js', appJs);

console.log('Fixed HTML structure');
