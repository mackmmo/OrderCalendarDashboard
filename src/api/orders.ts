const API = import.meta.env.VITE_API_URL;

export async function getOrders() {
    const response = await fetch(`${API}/sales-orders/`);

    if (!response.ok) {
        throw new Error("Failed to load orders");
    }

    return response.json();
}