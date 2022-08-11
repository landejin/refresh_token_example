const akey = 'access_token'
const rkey = 'refresh_token'

export function getAccessToken() {
    return localStorage.getItem(akey) || ''
}

export function setAccessToken(value: string) {
    localStorage.setItem(akey, value)
}

export function removeAccessToken() {
    localStorage.removeItem(akey)
}
  
export function getRefreshToken() {
    return localStorage.getItem(rkey) || ''
}

export function setRefreshToken(value: string) {
    localStorage.setItem(rkey, value)
}

export function removeRefreshToken() {
    localStorage.removeItem(rkey)
}