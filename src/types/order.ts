export interface SalesOrder {
    sales_order_id: number;
    sales_order_number: number;
    store_name: string;
    item: string;
    item_qty: number;
    qty_finished: number;
    finished: boolean;
    shipped: boolean;
    so_date: string;
    ship_date: string;
    finished_time_stamp: string | null;
    shipped_time_stamp: string | null;
}