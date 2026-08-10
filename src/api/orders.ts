// src/api/orders.ts
// assign API_URL from environment variable

import { refreshAccessToken } from './auth'

const API_URL = import.meta.env.VITE_API_URL 

// throw an error if API_URL is not set
if (!API_URL) {
  throw new Error('VITE_API_URL is not configured') 
}
// every sales order has the following fields, which are returned by the API
// defines the naming convention for the API response and data types used in the frontend
export interface ApiSalesOrder { 
  sales_order_id: number
  sales_order_number: number
  store_name: string
  item: string
  qty_ordered: number
  qty_finished: number
  qty_shipped: number
  finished: boolean
  shipped: boolean
  sales_order_date: string
  ship_date: string
  finished_time_stamp: string | null
  shipped_time_stamp: string | null
}

// defines the UI input for updating a sales order, which can include finished, shipped, qty_finished, and qty_shipped fields
// these are the fields that can be updated by the frontend, and the backend will handle updating the corresponding timestamps based on these fields
export interface UpdateSalesOrderInput {
  finished?: boolean
  shipped?: boolean
  qty_finished?: number
  qty_shipped?: number
}

// Helper function to get error message from response
// No response body: return status code and status text
// Response body is JSON: return stringified JSON
// Response body is not JSON: return raw text
async function getErrorMessage(response: Response): Promise<string> {
  const body = await response.text()

  if (!body) {
    return `${response.status} ${response.statusText}`
  }

  try {
    const parsed = JSON.parse(body)
    return JSON.stringify(parsed)
  } catch {
    return body
  }
}

function getAccessToken(): string {
  const accessToken = localStorage.getItem('accessToken')

  if (!accessToken) {
    throw new Error('User is not logged in')
  }

  return accessToken
}

async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  let accessToken = getAccessToken()

  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (response.status !== 401) {
    return response
  }

  accessToken = await refreshAccessToken()

  response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return response
}

// Gather sales orders from the API and return them as an array of ApiSalesOrder objects. 
// If the response is not ok, throw an error with the error message from the response. 
// If the response body is not an array, throw an error with a message indicating that the response body is not an array.
export async function getSalesOrders():
  Promise<ApiSalesOrder[]> {

  const response = await authenticatedFetch(
    `${API_URL}/sales-orders/`,
  )

  if (!response.ok) {
    throw new Error(
      `Failed to load sales orders: ${
        await getErrorMessage(response)
      }`,
    )
  }

  const data: unknown =
    await response.json()

  if (!Array.isArray(data)) {
    throw new Error(
      'Failed to load sales orders: response body is not an array',
    )
  }

  return data as ApiSalesOrder[]
}

// Update a sales order with the given changes and return the updated ApiSalesOrder object.
// If the response is not ok, throw an error with the error message from the response.
export async function updateSalesOrder(
  orderId: number,
  changes: UpdateSalesOrderInput,
): Promise<ApiSalesOrder> {

  const response = await authenticatedFetch(
    `${API_URL}/sales-orders/${orderId}/`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(changes),
    },
  )

  if (!response.ok) {
    throw new Error(
      `Failed to update sales order: ${
        await getErrorMessage(response)
      }`,
    )
  }

  return response.json()
}

// Delete a sales order with the given orderId. 
// If the response is not ok, throw an error with the error message from the response.
export async function deleteSalesOrder(
  orderId: number,
): Promise<void> {

  const response = await authenticatedFetch(
    `${API_URL}/sales-orders/${orderId}/`,
    {
      method: 'DELETE',
    },
  )

  if (!response.ok) {
    throw new Error(
      `Failed to delete sales order: ${
        await getErrorMessage(response)
      }`,
    )
  }
}

/*
 * Status helpers
 *
 * The backend should set or clear the corresponding timestamp:
 *
 * finished: true  -> finished_time_stamp = timezone.now()
 * finished: false -> finished_time_stamp = null
 *
 * shipped: true   -> shipped_time_stamp = timezone.now()
 * shipped: false  -> shipped_time_stamp = null
 */

// Mark a sales order as finished by setting the finished field to true.
export function markOrderFinished(
  orderId: number,
): Promise<ApiSalesOrder> {
  
  return updateSalesOrder(orderId, {
    finished: true,
  })
}

// Mark a sales order as not finished by setting the finished field to false.
export function undoOrderFinished(
  orderId: number,
): Promise<ApiSalesOrder> {
  return updateSalesOrder(orderId, {
    finished: false,
  })
}

// Mark a sales order as shipped by setting the shipped field to true.
export function markOrderShipped(
  orderId: number,
): Promise<ApiSalesOrder> {
  return updateSalesOrder(orderId, {
    shipped: true,
  })
}

// Mark a sales order as not shipped by setting the shipped field to false.
export function undoOrderShipped(
  orderId: number,
): Promise<ApiSalesOrder> {
  return updateSalesOrder(orderId, {
    shipped: false,
  })
}

// Update the finished quantity of a sales order by setting the qty_finished field to the given value.
export function updateFinishedQuantity(
  orderId: number,
  qtyFinished: number,
): Promise<ApiSalesOrder> {
  return updateSalesOrder(orderId, {
    qty_finished: qtyFinished,
  })
}

// Update the shipped quantity of a sales order by setting the qty_shipped field to the given value.
export function updateShippedQuantity(
  orderId: number,
  qtyShipped: number,
): Promise<ApiSalesOrder> {
  return updateSalesOrder(orderId, {
    qty_shipped: qtyShipped,
  })
}