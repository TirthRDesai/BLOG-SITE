import { deleteCookie, getCookie, setCookie } from "cookies-next"
import cookie from "cookiejs"

export class ServerSideCookies {
    constructor(req, res) {
        this.req = req
        this.res = res
    }

    setCustomCookie(key, value, options = {}) {
        const myOption = {
            req: this.req,
            res: this.res,
        }
        setCookie(key, value, myOption)
        if (getCookie(key) == value) {
            return true
        }
        return false
    }

    getCustomCookie(key, options = {}) {
        const { req, res } = this
        return getCookie(key, { req, res })
    }

    updateCustomCookie(key, value) {
        const { req, res } = this
        deleteCookie(key, { req, res })
        setCustomCookie(key, value)
        if (getCookie(key) == value) {
            return true
        }
        return false
    }

    deleteCustomCookie(key, options = {}) {
        const { req, res } = this
        deleteCookie(key, { req, res })
        if (getCookie(key) == undefined) {
            return true
        }
        return false
    }

    getCustomAllCookie() {
        const { req, res } = this
        return req.cookies
    }

    clear() {
        const { req, res } = this
        const allCookies = req.cookies
        for (const key in allCookies) {
            deleteCookie(key, { req, res })
        }
    }
}

export class ClientSideCookies {
    constructor() {
        this.cookies = cookie
    }

    setCustomCookie(key, value, options = {}) {
        this.cookies.set(key, value, options)
        if (this.getCustomCookie(key) == value) {
            return true
        }
        return false
    }

    getCustomCookie(key, options = {}) {
        return this.cookies.get(key)
    }

    updateCustomCookie(key, value) {
        this.cookies.remove(key)
        this.setCustomCookie(key, value)
        if (this.getCustomCookie(key) == value) {
            return true
        }
        return false
    }

    deleteCustomCookie(key, options = {}) {
        this.cookies.remove(key)
        if (this.getCustomCookie(key) == undefined) {
            return true
        }
        return false
    }

    getCustomAllCookie() {
        return this.cookies.all()
    }

    clear() {
        const allCookies = this.cookies.all()
        for (const key in allCookies) {
            this.cookies.remove(key)
        }
    }
}