import { initializeApp } from 'firebase/app'
import {
  getFirestore, collection, onSnapshot,
  addDoc, deleteDoc, doc,
} from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyBECtciQhkx_g8C_3WkjTYRVZREJ3GXW5E",
    authDomain: "fir-9-dojo-afab9.firebaseapp.com",
    projectId: "fir-9-dojo-afab9",
    storageBucket: "fir-9-dojo-afab9.appspot.com",
    messagingSenderId: "951724368610",
    appId: "1:951724368610:web:64bb9181627bdf2a9234bb"
}

// init firebase
initializeApp(firebaseConfig)

// init services
const database = getFirestore()

// collection ref
const colRef = collection(database, 'Invoice')

// realtime collection data
onSnapshot(colRef, (snapshot) => {
  let Invoice = []
  snapshot.docs.forEach(doc => {
    Invoice.push({ ...doc.data(), id: doc.id })
  })
  console.log(Invoice)
})

// adding docs
const addReceiptForm = document.querySelector('.add')
addReceiptForm.addEventListener('submit', (e) => {
  e.preventDefault()

  addDoc(colRef, {
    Description: addReceiptForm.hiddenInput.value,
    unitPrice: addReceiptForm.unitPrice.value,
    Tax:addReceiptForm.hiddenTax.value,
  })
  .then(() => {
    addReceiptForm.reset()
  })
})
//Testing.. - should approach in better way
const addReceiptForm2 = document.querySelector('.add2')
addReceiptForm2.addEventListener('submit', (e) => {
  e.preventDefault()

  addDoc(colRef, {
    Description: addReceiptForm2.hiddenInput.value,
    unitPrice: addReceiptForm2.unitPrice.value,
    Tax:addReceiptForm2.hiddenTax.value,
  })
  .then(() => {
    addReceiptForm2.reset()
  })
})

const addReceiptForm3 = document.querySelector('.add3')
addReceiptForm3.addEventListener('submit', (e) => {
  e.preventDefault()

  addDoc(colRef, {
    Description: addReceiptForm3.hiddenInput.value,
    unitPrice: addReceiptForm3.unitPrice.value,
    Tax:addReceiptForm3.hiddenTax.value,
  })
  .then(() => {
    addReceiptForm3.reset()
  })
})

const addReceiptForm4 = document.querySelector('.add4')
addReceiptForm4.addEventListener('submit', (e) => {
  e.preventDefault()

  addDoc(colRef, {
    Description: addReceiptForm4.hiddenInput.value,
    unitPrice: addReceiptForm4.unitPrice.value,
    Tax:addReceiptForm4.hiddenTax.value,
  })
  .then(() => {
    addReceiptForm4.reset()
  })
})

// deleting docs
/*const deleteReceiptForm = document.querySelector('.delete')
deleteReceiptForm.addEventListener('submit', (e) => {
  e.preventDefault()

  const docRef = doc(database, 'Invoice', deleteReceiptForm.id.value)

  deleteDoc(docRef)
    .then(() => {
      deleteReceiptForm.reset()
    })
})*/
