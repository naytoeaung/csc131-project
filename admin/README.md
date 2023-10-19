# How to use this code

## 1. Pulling Code from GitHub
You would probably need to watch a tutorial if you don't have git set up

## 2. Authentication
- Go to firebase settings > service accounts
- Download a new private key
- Create the file ".env" in the admin folder
- In the file, add the line `GOOGLE_APPLICATION_CREDENTIALS="path"`
- Put the full path to the file you downloaded in the string

## 3. Storage Bucket
- Open storage in firebase and create a bucket
- In your .env file, add a new line `STORAGE_BUCKET="[your bucket name].appspot.com"`
- Your bucket's name is in the gs:// link at the top of the bucket in firebase
- In Cloud Storage: Add a folder called "templates", and a sub-folder in templates called "invoice"
- In the invoice folder, upload template.tex and ansync.jpg, which can be found in the github
### Sample Storage Format
```
templates/
    invoice/
        template.tex
        ansync.jpg
documents/
   abc.pdf
   efg.pdf
```

## 4. Set up pdflatex
- We aren't using DynamicDocs yet, meaning the command line tool pdflatex needs to be installed first.
- Download it here: https://www.latex-project.org/get/#tex-distributions

## 5. Running
- Run `node admin/app.js` to run the code
- Or run `cd admin` first to switch to the admin folder, then run `node app.js`
- The code will automatically add random sample data to firestore, then generate a PDF from this data
- The console will not show a response (for now), but you can find the PDF in the storage bucket

## 6. Editing Code
- `app.js`: the main program
- `fill.js`: takes latex template and fills in @ symbols with data
- `generate.js`: takes completed latex code and converts to pdf
- `sample.js`: generates random sample data to put in firestore for testing
### Ignore
- `functions.js`: unfinished implementation of cloud functions
- `test.js`: unused code for running some tests