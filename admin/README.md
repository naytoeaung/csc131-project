# How to set up this code with your own Firebase project

## 1. Authentication
### Firebase
- Update the .firebaserc file with your project's id
- Download a private key in firebase settings > service accounts
  - Save it under `functions/credential.json`
- In the functions folder, create a .env file
  - Add `GOOGLE_APPLICATION_CREDENTIALS="credential.json"`
  - Add `STORAGE_BUCKET="[your sotrage bucket].appspot.com"`
### DynamicDocs
- Create a [DynamicDocs](https://advicement.io/dynamic-documents-api/dashboard) account and create an API key
- To the .env file, add `DYNAMIC_DOCS_TOKEN="[your token]"`
### SendGrid
- Create a [SendGrid](https://sendgrid.com/en-us/pricing) account and create an API key
- To the .env file, add:
  - `SENDGRID_API_KEY="[your api key]"`
  - `SENDGRID_EMAIL="[your sender email]"`
  - `SAMPLE_EMAIL="[sample email for testing]"`
    - This is only used in testing as a "to" address

## 2. Deploy Functions
- Run `cd functions` to change to the functions directory
- Run `npm install` to download all dependencies
- Run `firebase deploy --only functions`

## 3. Use Our Default Templates
All of our pre-made templates can be found under the templates and emailTemplates folders. These can be edited for your specific needs. Add these templates to Cloud Storage in the following format:
```
templates/
    invoiceSimple/
        template.tex
        ansync.jpg
emailTemplates/
    invoice/
        template.html
```
the file `sample.js` contains randomized firestore data to give you an idea of how firestore should be formatted to run the document.