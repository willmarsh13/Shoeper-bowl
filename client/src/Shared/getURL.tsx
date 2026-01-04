export function getURL(): string {
    return window.location.hostname === "localhost" ? "http://localhost:3001" : `${window.location.protocol}//${window.location.hostname}`
}
