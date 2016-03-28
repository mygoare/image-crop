### Follow steps below:

1. `npm install`
2. `brew install`
3. `node app.js`
4. open link: `localhost:3001/upload`

After upload file and crop it, you can access avatar like this: `http://localhost:3001/files/e273e1192865dbfc36c945d5b1652996-avatar`
and resize through adding `size` parameter after the link, like this: `http://localhost:3001/files/e273e1192865dbfc36c945d5b1652996-avatar?size=200`


### Note:

1. You need install  GraphicsMagick or ImageMagick (gm module depends on it) first.
2. Sometimes need turn OFF Astrill to make sure upload files successfully.
