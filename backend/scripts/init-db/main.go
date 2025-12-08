package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func main() {
	connStr := "host=localhost port=5432 user=unlimited password=unlimited123 dbname=unlimited_corp sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to connect:", err)
	}
	defer db.Close()

	sqlFile := "migrations/init.sql"
	sqlBytes, err := os.ReadFile(sqlFile)
	if err != nil {
		log.Fatal("Failed to read SQL file:", err)
	}

	_, err = db.Exec(string(sqlBytes))
	if err != nil {
		log.Fatal("Failed to execute SQL:", err)
	}

	fmt.Println("✅ Database initialized successfully!")

	rows, err := db.Query(`
		SELECT table_name
		FROM information_schema.tables
		WHERE table_schema = 'public'
		ORDER BY table_name
	`)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	fmt.Println("\nCreated tables:")
	count := 0
	for rows.Next() {
		var tableName string
		if err := rows.Scan(&tableName); err != nil {
			log.Fatal(err)
		}
		count++
		fmt.Printf("  %d. %s\n", count, tableName)
	}
}
