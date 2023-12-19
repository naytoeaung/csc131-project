/**
 * Sets up environment variables and single, shared firebase instance
 * @module setup
 */

require('dotenv').config({ path: "../.env" });
require('dotenv').config();
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

let app;

/**
 * Returns one shared instance of Firestore and Cloud Storage
 * @returns Object containing firestore db and storage
 */
function getFirebase() {
    if (!app)
        app = initializeApp({
            storageBucket: process.env.STORAGE_BUCKET
        });
    return {
        db: getFirestore(app),
        storage: getStorage(app)
    };
}

module.exports = { getFirebase };