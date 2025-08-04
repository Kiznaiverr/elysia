// Simple wrapper for siputzx.my.id API
const BASE_URL = 'https://api.siputzx.my.id';

export async function siputzxRequest(endpoint, params = {}) {
    const url = new URL(BASE_URL + endpoint);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.append(key, value);
        }
    });
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
}

// For getting buffer data (like images)
export async function siputzxBuffer(endpoint, params = {}) {
    const url = new URL(BASE_URL + endpoint);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.append(key, value);
        }
    });
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
}
