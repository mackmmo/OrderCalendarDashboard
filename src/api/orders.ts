// src/api/orders.ts

const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error('VITE_API_URL is not configured')
}

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

export interface CreateSalesOrderInput {
  sales_order_number: number
  store_name: string
  item: 'BSO' | 'MP'
  qty_ordered: number
  qty_finished?: number
  qty_shipped?: number
  finished?: boolean
  shipped?: boolean
  sales_order_date: string
  ship_date: string
}

export type UpdateSalesOrderInput = Partial<
  Pick<
    ApiSalesOrder,
    | 'sales_order_number'
    | 'store_name'
    | 'item'
    | 'qty_ordered'
    | 'qty_finished'
    | 'qty_shipped'
    | 'finished'
    | 'shipped'
    | 'sales_order_date'
    | 'ship_date'
  >
>

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

export async function getSalesOrders(): Promise<ApiSalesOrder[]> {
  const response = await fetch(`${API_URL}/sales-orders/`)

  if (!response.ok) {
    throw new Error(
      `Failed to load sales orders: ${await getErrorMessage(response)}`,
    )
  }

  const data: unknown = await response.json()

  // Supports either a plain array or a paginated DRF response.
  if (Array.isArray(data)) {
    return data as ApiSalesOrder[]
  }

  if (
    typeof data === 'object' &&
    data !== null &&
    'results' in data &&
    Array.isArray((data as { results: unknown }).results)
  ) {
    return (data as { results: ApiSalesOrder[] }).results
  }

  throw new Error('Unexpected sales-order response format')
}

export async function getSalesOrder(
  orderId: number,
): Promise<ApiSalesOrder> {
  const response = await fetch(
    `${API_URL}/sales-orders/${orderId}/`,
  )

  if (!response.ok) {
    throw new Error(
      `Failed to load sales order: ${await getErrorMessage(response)}`,
    )
  }

  return response.json()
}

export async function createSalesOrder(
  order: CreateSalesOrderInput,
): Promise<ApiSalesOrder> {
  const response = await fetch(`${API_URL}/sales-orders/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(order),
  })

  if (!response.ok) {
    throw new Error(
      `Failed to create sales order: ${await getErrorMessage(response)}`,
    )
  }

  return response.json()
}

export async function updateSalesOrder(
  orderId: number,
  changes: UpdateSalesOrderInput,
): Promise<ApiSalesOrder> {
  const response = await fetch(
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
      `Failed to update sales order: ${await getErrorMessage(response)}`,
    )
  }

  return response.json()
}

export async function deleteSalesOrder(
  orderId: number,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/sales-orders/${orderId}/`,
    {
      method: 'DELETE',
    },
  )

  if (!response.ok) {
    throw new Error(
      `Failed to delete sales order: ${await getErrorMessage(response)}`,
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

export function markOrderFinished(
  orderId: number,
): Promise<ApiSalesOrder> {
  return updateSalesOrder(orderId, {
    finished: true,
  })
}

export function undoOrderFinished(
  orderId: number,
): Promise<ApiSalesOrder> {
  return updateSalesOrder(orderId, {
    finished: false,
  })
}

export function markOrderShipped(
  orderId: number,
): Promise<ApiSalesOrder> {
  return updateSalesOrder(orderId, {
    shipped: true,
  })
}

export function undoOrderShipped(
  orderId: number,
): Promise<ApiSalesOrder> {
  return updateSalesOrder(orderId, {
    shipped: false,
  })
}

export function updateFinishedQuantity(
  orderId: number,
  qtyFinished: number,
): Promise<ApiSalesOrder> {
  return updateSalesOrder(orderId, {
    qty_finished: qtyFinished,
  })
}

export function updateShippedQuantity(
  orderId: number,
  qtyShipped: number,
): Promise<ApiSalesOrder> {
  return updateSalesOrder(orderId, {
    qty_shipped: qtyShipped,
  })
}