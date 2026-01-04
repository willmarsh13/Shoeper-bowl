export function getURL(): string {
    return window.location.hostname === "localhost" ? "http://localhost:3002" : `${window.location.protocol}//${window.location.hostname}/shoeper-bowl`
}
