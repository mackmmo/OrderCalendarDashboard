// Authorization API functions for the Order Calendar Dashboard application

// API URL is retrieved from environment variables. Ensure that VITE_API_URL is defined in your .env file.
const API_URL = import.meta.env.VITE_API_URL
if (!API_URL) {
  throw new Error('VITE_API_URL is not defined in the environment variables.')
}
// Interface representing the structure of the login response from the API
export interface LoginResponse {
  response: string
  refresh: string
}
// Function to perform login by sending a POST request to the API with the provided username and password
export async function login(
    username: string,
    password: string,
): Promise<LoginResponse> { // Ensure that the API URL is defined before making the request
    const response = await fetch( // Define the API endpoint for login using the base API URL and the login path
        `${API_URL}/login`, 
        {
            method: 'POST', // Specify the HTTP method as POST for sending data to the server
            headers: {
                'Content-Type': 'application/json' // Set the content type to JSON to indicate that the request body contains JSON data
            },
            body: JSON.stringify({ username, password }) // Convert the username and password into a JSON string to be sent in the request body
        }
    )

    if (!response.ok) {
        throw new Error('Failed to login')
    }

    return response.json() as Promise<LoginResponse> // Parse the JSON response from the server and return it as a Promise of type LoginResponse
}