import { login } from '../api/auth';
import React, { useState } from 'react';


export default function Login() { // Define the Login component for the Production Dashboard application
    const [password, setPassword] = useState<string>(''); // State variable to hold the password input value. Default is an empty string. The type is explicitly set to string.
    const [username, setUsername] = useState<string>(''); // State variable to hold the username input value. Default is an empty string. The type is explicitly set to string.
    const [error, setError] = useState<string | null>(null); // State variable to hold any error messages. It can be a string or null. Default is null.

async function handleLogin( // Function to handle the login form submission
    event: React.FormEvent<HTMLFormElement> //
) {
    event.preventDefault(); // Prevent the default form submission behavior
    
    try {
        setError(null); // Reset any previous error messages

        const tokens = await login( // Call the login function from the auth API with the provided username and password
            username, 
            password
        ) // Call the login function with the provided username and password
        
        console.log('Login successful:', tokens); // Log the successful login response to the console
    } catch (err) {
        setError('Login failed. Please check your credentials and try again.'); // Set an error message if the login fails
        console.error('Login error:', err); // Log the error to the console for debugging purposes
    }
}

return (
    <div> 
        <h1> Production Dashboard Login</h1>

        <form onSubmit={handleLogin}> // Form element that triggers the handleLogin function on submission
            <label>
                Username:   
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value) // Update the username state variable when the input value changes
                }
              />
            </label>
            <label>
                Password:
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)
                }
              />
            </label>
            
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message if login fails */}

            <button type="submit">
                Sign In
            </button>
        </form>
    </div>
)
}