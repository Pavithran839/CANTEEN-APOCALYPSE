-- ============================================================
-- CANTEEN APOCALYPSE - DATABASE SQL SCRIPT
-- MySQL 8.0+
--
-- Includes:
--   1. Database and table DDL
--   2. View: canteen_daily_summary
--   3. Stored procedures:
--        sp_canteen_analytics
--        sp_get_canteen_alerts
--   4. Trigger:
--        trg_calculate_chaos_score
--   5. Representative DML, transaction, and verification queries
--
-- IMPORTANT:
--   This is a setup/reference script. CREATE TABLE IF NOT EXISTS
--   does not modify an already-existing table definition.
--   It does not drop existing project data.
-- ============================================================

CREATE DATABASE IF NOT EXISTS canteen_apocalypse;
USE canteen_apocalypse;

-- ============================================================
-- 1. DDL: TABLE CREATION
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    user_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    UNIQUE KEY email (email)
);

CREATE TABLE IF NOT EXISTS canteens (
    canteen_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    capacity INT NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    contact_number VARCHAR(15) DEFAULT NULL,
    PRIMARY KEY (canteen_id),
    KEY idx_canteen_location (location),
    CONSTRAINT chk_capacity CHECK (capacity > 0)
);

CREATE TABLE IF NOT EXISTS counters (
    counter_id INT NOT NULL AUTO_INCREMENT,
    canteen_id INT NOT NULL,
    counter_name VARCHAR(100) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    status ENUM('OPEN', 'CLOSED') DEFAULT 'OPEN',
    PRIMARY KEY (counter_id),
    KEY fk_counter_canteen (canteen_id),
    CONSTRAINT fk_counter_canteen
        FOREIGN KEY (canteen_id) REFERENCES canteens (canteen_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS observations (
    observation_id INT NOT NULL AUTO_INCREMENT,
    canteen_id INT NOT NULL,
    counter_id INT DEFAULT NULL,
    reported_by INT NOT NULL,
    people_count INT NOT NULL,
    queue_length INT NOT NULL,
    wait_time_minutes INT NOT NULL,
    chaos_score DECIMAL(5,2) NOT NULL,
    observed_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (observation_id),
    KEY fk_observation_canteen (canteen_id),
    KEY fk_observation_counter (counter_id),
    KEY fk_observation_user (reported_by),
    KEY idx_observation_time (observed_at),
    KEY idx_chaos_score (chaos_score),
    CONSTRAINT fk_observation_canteen
        FOREIGN KEY (canteen_id) REFERENCES canteens (canteen_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_observation_counter
        FOREIGN KEY (counter_id) REFERENCES counters (counter_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_observation_user
        FOREIGN KEY (reported_by) REFERENCES users (user_id)
        ON DELETE CASCADE,
    CONSTRAINT chk_chaos_score CHECK (chaos_score BETWEEN 0 AND 100),
    CONSTRAINT chk_people_count CHECK (people_count >= 0),
    CONSTRAINT chk_queue_length CHECK (queue_length >= 0),
    CONSTRAINT chk_wait_time CHECK (wait_time_minutes >= 0)
);

CREATE TABLE IF NOT EXISTS alerts (
    alert_id INT NOT NULL AUTO_INCREMENT,
    canteen_id INT NOT NULL,
    observation_id INT DEFAULT NULL,
    alert_type VARCHAR(100) NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    message VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    is_resolved TINYINT(1) DEFAULT 0,
    PRIMARY KEY (alert_id),
    KEY fk_alert_canteen (canteen_id),
    KEY fk_alert_observation (observation_id),
    KEY idx_alert_severity (severity),
    CONSTRAINT fk_alert_canteen
        FOREIGN KEY (canteen_id) REFERENCES canteens (canteen_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_alert_observation
        FOREIGN KEY (observation_id) REFERENCES observations (observation_id)
        ON DELETE SET NULL
);

-- ============================================================
-- 2. DML: REPRESENTATIVE INSERT / SELECT STATEMENTS
-- ============================================================

-- The project already has application-managed users and sample data.
-- Do not insert plain-text passwords. Store bcrypt password hashes
-- through the application registration/admin setup process.

-- Example canteen insert (use only if this canteen does not already exist):
-- INSERT INTO canteens (name, location, capacity, status)
-- VALUES ('Example Canteen', 'Campus', 100, 'ACTIVE');

-- Example counter insert:
-- INSERT INTO counters (canteen_id, counter_name, service_type, status)
-- VALUES (1, 'Meals Counter', 'Meals', 'OPEN');

-- Example observation insert:
-- The trigger below calculates chaos_score automatically.
-- Replace IDs with valid IDs from your database.
-- INSERT INTO observations
-- (canteen_id, counter_id, reported_by, people_count,
--  queue_length, wait_time_minutes, observed_at)
-- VALUES (1, 1, 1, 80, 40, 30, NOW());

-- Common SELECT queries used for project data retrieval:
SELECT canteen_id, name, capacity, status
FROM canteens;

SELECT counter_id, canteen_id, counter_name, service_type, status
FROM counters;

SELECT observation_id, canteen_id, people_count, queue_length,
       wait_time_minutes, chaos_score, observed_at
FROM observations
ORDER BY observed_at DESC;

SELECT alert_id, canteen_id, observation_id, severity, message,
       created_at, is_resolved
FROM alerts
ORDER BY created_at DESC;

-- ============================================================
-- 3. ADVANCED SQL: VIEW
-- ============================================================

CREATE OR REPLACE VIEW canteen_daily_summary AS
SELECT
    c.canteen_id,
    c.name AS canteen_name,
    CAST(o.observed_at AS DATE) AS summary_date,
    ROUND(AVG(o.people_count), 2) AS avg_people_count,
    ROUND(AVG(o.wait_time_minutes), 2) AS avg_wait_time,
    MAX(o.people_count) AS max_people_count,
    ROUND(AVG(o.chaos_score), 2) AS avg_chaos_score
FROM canteens AS c
JOIN observations AS o
    ON c.canteen_id = o.canteen_id
GROUP BY
    c.canteen_id,
    c.name,
    CAST(o.observed_at AS DATE);

-- Test the view:
-- SELECT * FROM canteen_daily_summary
-- ORDER BY summary_date DESC, canteen_id;

-- ============================================================
-- 4. ADVANCED SQL: STORED PROCEDURE 1 - CANTEEN ANALYTICS
-- ============================================================

DROP PROCEDURE IF EXISTS sp_canteen_analytics;

DELIMITER //

CREATE PROCEDURE sp_canteen_analytics(IN p_canteen_id INT)
BEGIN
    SELECT
        c.canteen_id,
        c.name AS canteen_name,
        ROUND(AVG(o.people_count), 2) AS avg_people_count,
        ROUND(AVG(o.wait_time_minutes), 2) AS avg_wait_time,
        MAX(o.people_count) AS max_people_count,
        ROUND(AVG(o.chaos_score), 2) AS avg_chaos_score
    FROM canteens AS c
    LEFT JOIN observations AS o
        ON c.canteen_id = o.canteen_id
    WHERE c.canteen_id = p_canteen_id
    GROUP BY c.canteen_id, c.name;
END //

DELIMITER ;

-- Test:
-- CALL sp_canteen_analytics(1);

-- ============================================================
-- 5. ADVANCED SQL: STORED PROCEDURE 2 - CANTEEN ALERTS
-- ============================================================

DROP PROCEDURE IF EXISTS sp_get_canteen_alerts;

DELIMITER //

CREATE PROCEDURE sp_get_canteen_alerts(IN p_canteen_id INT)
BEGIN
    SELECT
        alert_id,
        canteen_id,
        observation_id,
        alert_type,
        severity,
        message,
        created_at,
        is_resolved
    FROM alerts
    WHERE canteen_id = p_canteen_id
    ORDER BY created_at DESC;
END //

DELIMITER ;

-- Test:
-- CALL sp_get_canteen_alerts(1);

-- ============================================================
-- 6. ADVANCED SQL: TRIGGER - AUTOMATIC CHAOS SCORE
-- ============================================================

DROP TRIGGER IF EXISTS trg_calculate_chaos_score;

DELIMITER //

CREATE TRIGGER trg_calculate_chaos_score
BEFORE INSERT ON observations
FOR EACH ROW
BEGIN
    DECLARE v_capacity INT;

    SELECT capacity
    INTO v_capacity
    FROM canteens
    WHERE canteen_id = NEW.canteen_id;

    SET NEW.chaos_score = ROUND(
        0.40 * LEAST((NEW.people_count / v_capacity) * 100, 100)
        +
        0.30 * LEAST((NEW.queue_length / v_capacity) * 100, 100)
        +
        0.30 * LEAST((NEW.wait_time_minutes / 60) * 100, 100),
        2
    );
END //

DELIMITER ;

-- Test the trigger with a valid canteen_id, counter_id and reported_by:
-- INSERT INTO observations
-- (canteen_id, counter_id, reported_by, people_count,
--  queue_length, wait_time_minutes, observed_at)
-- VALUES (1, 1, 1, 80, 40, 30, NOW());
--
-- Expected Chaos Score for capacity 100: 59.00
-- The trigger assigns chaos_score; do not provide it in the INSERT.

-- ============================================================
-- 7. ADVANCED SQL: TRANSACTION / ROW-LEVEL LOCKING EXAMPLE
-- ============================================================

-- The application uses transactions when saving an observation and
-- maintaining the canteen's active crowd alert. The following is a
-- simplified SQL pattern for demonstrating transaction concepts.
-- Run only with valid IDs and adapt it to the application's full
-- alert anti-duplicate logic.

-- START TRANSACTION;
-- SELECT canteen_id
-- FROM canteens
-- WHERE canteen_id = 1
-- FOR UPDATE;
--
-- INSERT INTO observations
-- (canteen_id, counter_id, reported_by, people_count,
--  queue_length, wait_time_minutes, observed_at)
-- VALUES (1, 1, 1, 80, 40, 30, NOW());
--
-- COMMIT;
-- Use ROLLBACK instead of COMMIT to discard a test transaction.

-- ============================================================
-- 8. VERIFICATION QUERIES
-- ============================================================

SHOW TABLES;

SHOW FULL TABLES
WHERE Table_type = 'VIEW';

SHOW PROCEDURE STATUS
WHERE Db = 'canteen_apocalypse';

SHOW TRIGGERS FROM canteen_apocalypse;

-- Test both procedures after the database contains relevant records:
-- CALL sp_canteen_analytics(1);
-- CALL sp_get_canteen_alerts(1);

-- ============================================================
-- 9. ADVANCED CONCEPTS - SHORT PRESENTATION NOTES
-- ============================================================

-- TRANSACTIONS:
-- Groups related database operations into one unit. COMMIT saves
-- changes; ROLLBACK cancels uncommitted changes.

-- VIEW:
-- canteen_daily_summary presents daily aggregate statistics using
-- JOIN, AVG, MAX, GROUP BY and date conversion.

-- STORED PROCEDURES:
-- sp_canteen_analytics returns aggregate analytics for one canteen.
-- sp_get_canteen_alerts returns that canteen's alerts newest first.

-- TRIGGER:
-- trg_calculate_chaos_score runs BEFORE INSERT on observations and
-- calculates the weighted Chaos Score using the canteen's capacity.

-- END OF CANTEEN APOCALYPSE SQL SCRIPT
