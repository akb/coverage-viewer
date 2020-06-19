package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/handlers"
)

const (
	listenAddress = ":8080"
)

func main() {
	defer r.Stop()
	http.Handle("/", handlers.LoggingHandler(os.Stdout, http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			http.ServeFile(w, r, "./index.html")
		},
	)))

	http.Handle("/api/", handlers.LoggingHandler(os.Stdout, http.HandlerFunc(api)))

	static := http.StripPrefix("/static/", http.FileServer(http.Dir("./static")))
	http.Handle("/static/", handlers.LoggingHandler(os.Stdout, static))

	log.Printf("Serving HTTP on %s\n", listenAddress)
	log.Fatal(http.ListenAndServe(listenAddress, nil))
}
