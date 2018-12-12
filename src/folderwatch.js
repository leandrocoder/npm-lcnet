const Path = require('path');
const FS = require('fs');
const WatchTree = require("fs-watch-tree").watchTree;

module.exports = class FolderWatch
{
    static StartWatchChangestWatch(dir, onFileChange)
    {
        //let dir = Path.join(__dirname, `../data/simulateddata/`);

        console.log("Folder watch: " + dir);
        let blockList = [];
        let watch = WatchTree(dir, function (event) {
            let filename = event.name;
            let index = filename.indexOf(".json");
            if (index > 0) {
                let type = filename.substr(0, index);
                let indexInBlock = blockList.indexOf(type);
                if (indexInBlock < 0)
                {
                    let isDir = event.isDirectory();
                    let wasChanged = event.isModify();
                    let wasDeleted = event.isDelete();

                    blockList.push(type);
                    setTimeout(function() {
                        blockList.splice(blockList.indexOf(type), 1);
                    }, 500);
                    
                    if (isDir == false && wasDeleted == false && wasChanged == true) {
                        
                        if (onFileChange != null) {
                            onFileChange(filename);
                        }
                        else {
                            console.log(`File changed: ${filename}`);
                        }
                    }
                }
            }
        }.bind(this));
    }
}

