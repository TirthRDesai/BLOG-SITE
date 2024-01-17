import React from 'react';


const CryptoJS = require("crypto-js")


export default function EncryptingFunctions() {
    return null
}

export const EncryptData = (data) => {
    return CryptoJS.AES.encrypt(data, process.env.NEXT_PUBLIC_KEY).toString()
}

export const DecryptData = (data) => {
    return CryptoJS.AES.decrypt(data, process.env.NEXT_PUBLIC_KEY).toString(CryptoJS.enc.Utf8)
}