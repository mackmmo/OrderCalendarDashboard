// Authorization API functions for the Order Calendar Dashboard application

// First Response _________________________________________________________________________________

// API URL is retrieved from environment variables. Ensure that VITE_API_URL is defined in your .env file.
const API_URL = import.meta.env.VITE_API_URL
if (!API_URL) {
  throw new Error('VITE_API_URL is not defined in the environment variables.')
}
// Interface representing the structure of the login response from the API
export interface LoginResponse {
  access: string
  refresh: string
}

// Function to perform login by sending a POST request to the API with the provided username and password
export async function login(
    username: string,
    password: string,
): Promise<LoginResponse> { // Ensure that the API URL is defined before making the request
    const response = await fetch( // Define the API endpoint for login using the base API URL and the login path
        `${API_URL}/api/token/`, 
        {
            method: 'POST', // Specify the HTTP method as POST for sending data to the server
            headers: {
                'Content-Type': 'application/json' // Set the content type to JSON to indicate that the request body contains JSON data
            },
            body: JSON.stringify({ username, password }) // Convert the username and password into a JSON string to be sent in the request body
        }
    )

    if (!response.ok) {
        const errorText = await response.text() // Read the response text for debugging purposes
        
        console.error(
            'Login Failed:',
            response.status,
            response.statusText,
            errorText
        )

        throw new Error(`Login failed: ${response.status}`)
    }

    return response.json() as Promise<LoginResponse> // Parse the JSON response from the server and return it as a Promise of type LoginResponse
}

// Refresh Response _________________________________________________________________________________

export interface RefreshResponse {
  access: string
}

export async function refreshAccessToken(): Promise<string> {
  const refreshToken =
    localStorage.getItem('refreshToken')

  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await fetch(
    `${API_URL}/api/token/refresh/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    },
  )

  if (!response.ok) {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')

    window.dispatchEvent(
        new Event('auth-expired')
    )
    
    throw new Error('Refresh token is invalid or expired')
  }

  const data: RefreshResponse =
    await response.json()

  localStorage.setItem(
    'accessToken',
    data.access,
  )

  return data.access
}