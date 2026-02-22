-- For each warehouse, calculate the number of routes and the average delivery time
-- Assumptions:
-- 1. warehouses(id, name)
-- 2. routes(id, warehouse_id, departure_time, arrival_time)
-- 3. delivery_time is calculated as arrival_time - departure_time

SELECT
    w.id AS warehouse_id,
    w.city AS warehouse_city,
    COUNT(r.id) AS number_of_routes,
    AVG(r.delivery_days) AS avg_delivery_days
FROM warehouses w
LEFT JOIN routes r
    ON r.warehouse_id = w.id
GROUP BY w.id, w.city
ORDER BY w.id;
