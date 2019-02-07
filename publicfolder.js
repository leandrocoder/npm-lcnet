const express = require('express');

module.exports = class PublicFolder
{
    constructor(path, port, alias)
    {
        if (!alias || alias == "") alias = "/";
        this.app = express();
        this.app.use(alias, express.static(path));
        this.app.listen(port);
        console.log(`public folder at ${port}`);
    }
}